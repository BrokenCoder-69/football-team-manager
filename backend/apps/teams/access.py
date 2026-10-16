"""
Team-level data isolation lives here (design §3.6).

Every team-owned endpoint has the team id in its URL (/api/v1/teams/<team_id>/...)
and inherits TeamScopedMixin. Before the view runs, the mixin loads the caller's
*active* membership in that team and stores it on self.membership. Views then
build every query from self.membership.team, so another team's data is never
reachable. Later milestones (events, payments, squads) reuse this unchanged.
"""
from django.http import Http404
from rest_framework.exceptions import PermissionDenied

from .models import Membership


def get_active_membership(user, team_id):
    membership = (
        Membership.objects.select_related("team", "user")
        .filter(
            team_id=team_id,
            user=user,
            status=Membership.Status.ACTIVE,
            team__archived_at__isnull=True,
        )
        .first()
    )
    if membership is None:
        # 404, not 403: outsiders can't even learn whether a team id exists.
        raise Http404("Team not found.")
    return membership


class TeamScopedMixin:
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)  # the login check happens here first
        self.membership = get_active_membership(request.user, kwargs["team_id"])

    @property
    def team(self):
        return self.membership.team

    def require_manager(self):
        if not self.membership.is_manager:
            raise PermissionDenied("Only the team's owner, admins or captains can do this.")

    def require_admin(self):
        if not self.membership.is_admin:
            raise PermissionDenied("Only the team's owner or admins can do this.")

    def require_owner(self):
        if self.membership.role != Membership.Role.OWNER:
            raise PermissionDenied("Only the team's owner can do this.")