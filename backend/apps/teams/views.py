from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .access import TeamScopedMixin
from .models import Membership, Team, generate_invite_code
from .serializers import (
    JoinTeamSerializer,
    MembershipSerializer,
    RoleChangeSerializer,
    TeamSerializer,
)

Role = Membership.Role
Status = Membership.Status


# --- Teams -----------------------------------------------------------------


class TeamListCreateView(generics.ListCreateAPIView):
    """GET: the teams I belong to. POST: create a team; I become its owner."""

    serializer_class = TeamSerializer

    def get_queryset(self):
        return Team.objects.filter(
            archived_at__isnull=True,
            memberships__user=self.request.user,
            memberships__status=Status.ACTIVE,
        )

    @transaction.atomic
    def perform_create(self, serializer):
        team = serializer.save(created_by=self.request.user)
        Membership.objects.create(
            team=team,
            user=self.request.user,
            role=Role.OWNER,
            status=Status.ACTIVE,
            joined_at=timezone.now(),
        )


class TeamDetailView(TeamScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    """GET: any member. PATCH: owner or admin. DELETE (archive): owner only."""

    serializer_class = TeamSerializer

    def get_object(self):
        return self.team

    def perform_update(self, serializer):
        self.require_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self.require_owner()
        instance.archived_at = timezone.now()
        instance.save(update_fields=["archived_at"])


class RegenerateInviteView(TeamScopedMixin, APIView):
    """POST: replace the invite code, so an old or leaked code stops working."""

    def post(self, request, team_id):
        self.require_admin()
        self.team.invite_code = generate_invite_code()
        self.team.save(update_fields=["invite_code"])
        return Response({"invite_code": self.team.invite_code})


class JoinTeamView(APIView):
    """POST invite_code: ask to join a team. A manager must then approve."""

    def post(self, request):
        serializer = JoinTeamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        team = Team.objects.filter(
            invite_code=serializer.validated_data["invite_code"], archived_at__isnull=True
        ).first()
        if team is None:
            raise ValidationError({"invite_code": "No team uses this invite code."})

        membership, created = Membership.objects.get_or_create(team=team, user=request.user)
        if membership.status == Status.ACTIVE:
            raise ValidationError({"invite_code": "You are already a member of this team."})
        if not created and membership.status != Status.PENDING:
            # Rejected, removed or left earlier: start again as a plain player.
            membership.status = Status.PENDING
            membership.role = Role.PLAYER
            membership.joined_at = None
            membership.save(update_fields=["status", "role", "joined_at"])

        return Response(
            {"team": {"id": team.id, "name": team.name}, "status": membership.status},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class LeaveTeamView(TeamScopedMixin, APIView):
    def post(self, request, team_id):
        if self.membership.role == Role.OWNER:
            raise ValidationError({"detail": "The owner can't leave. Archive the team instead."})
        self.membership.status = Status.LEFT
        self.membership.save(update_fields=["status"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- Members ---------------------------------------------------------------


class MemberListView(TeamScopedMixin, generics.ListAPIView):
    """GET: active members. Managers can add ?status=pending to see join requests."""

    serializer_class = MembershipSerializer

    def get_queryset(self):
        wanted = self.request.query_params.get("status", Status.ACTIVE)
        if wanted != Status.ACTIVE:
            self.require_manager()
        return Membership.objects.select_related("user").filter(team=self.team, status=wanted)


class MemberDetailView(TeamScopedMixin, generics.RetrieveUpdateAPIView):
    """
    GET: any member. PATCH (jersey, positions, foot, player status):
    the member themselves, or a manager who outranks them.
    """

    serializer_class = MembershipSerializer

    def get_object(self):
        return get_object_or_404(
            Membership.objects.select_related("user"),
            team=self.team,
            pk=self.kwargs["member_id"],
            status=Status.ACTIVE,
        )

    def perform_update(self, serializer):
        target = serializer.instance
        is_self = target.pk == self.membership.pk
        if not is_self and not (self.membership.is_manager and self.membership.outranks(target)):
            raise PermissionDenied("You can't edit this member.")
        serializer.save()


class MemberActionView(TeamScopedMixin, APIView):
    """Shared plumbing for the POST actions below."""

    target_status = Status.ACTIVE

    def get_target(self):
        return get_object_or_404(
            Membership.objects.select_related("user"),
            team=self.team,
            pk=self.kwargs["member_id"],
            status=self.target_status,
        )

    def respond(self, target):
        return Response(MembershipSerializer(target).data)


class ApproveMemberView(MemberActionView):
    target_status = Status.PENDING

    def post(self, request, team_id, member_id):
        self.require_manager()
        target = self.get_target()
        target.status = Status.ACTIVE
        target.joined_at = timezone.now()
        target.save(update_fields=["status", "joined_at"])
        return self.respond(target)


class RejectMemberView(MemberActionView):
    target_status = Status.PENDING

    def post(self, request, team_id, member_id):
        self.require_manager()
        target = self.get_target()
        target.status = Status.REJECTED
        target.save(update_fields=["status"])
        return self.respond(target)


class RemoveMemberView(MemberActionView):
    def post(self, request, team_id, member_id):
        self.require_manager()
        target = self.get_target()
        if not self.membership.outranks(target):
            raise PermissionDenied("You can only remove members below your own role.")
        target.status = Status.REMOVED
        target.role = Role.PLAYER
        target.save(update_fields=["status", "role"])
        return self.respond(target)


class ChangeRoleView(MemberActionView):
    """POST role=admin|captain|player. You must outrank both the member and the new role."""

    def post(self, request, team_id, member_id):
        self.require_admin()
        serializer = RoleChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data["role"]

        target = self.get_target()
        if not self.membership.outranks(target):
            raise PermissionDenied("You can only change roles of members below your own role.")
        if self.membership.rank <= Membership.RANK[new_role]:
            raise PermissionDenied("You can only give out roles below your own.")
        target.role = new_role
        target.save(update_fields=["role"])
        return self.respond(target)