from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer

from .models import Membership, Team


class TeamSerializer(serializers.ModelSerializer):
    my_role = serializers.SerializerMethodField()
    invite_code = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            "id", "name", "description", "location", "contact_phone",
            "primary_color", "secondary_color",
            "my_role", "invite_code", "member_count", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def _my_membership(self, team):
        # Cached on the object so the three fields below share one query.
        if not hasattr(team, "_my_membership"):
            team._my_membership = team.memberships.filter(
                user=self.context["request"].user, status=Membership.Status.ACTIVE
            ).first()
        return team._my_membership

    def get_my_role(self, team):
        membership = self._my_membership(team)
        return membership.role if membership else None

    def get_invite_code(self, team):
        # Only people who can approve join requests may hand out the code.
        membership = self._my_membership(team)
        return team.invite_code if membership and membership.is_manager else None

    def get_member_count(self, team):
        return team.memberships.filter(status=Membership.Status.ACTIVE).count()


class MembershipSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = [
            "id", "user", "role", "status",
            "jersey_number", "position", "secondary_position",
            "preferred_foot", "player_status", "joined_at",
        ]
        # Role and status only change through their own endpoints,
        # where the permission rules are enforced.
        read_only_fields = ["id", "role", "status", "joined_at"]


class JoinTeamSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=8)

    def validate_invite_code(self, value):
        return value.strip().upper()


class RoleChangeSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[Membership.Role.ADMIN, Membership.Role.CAPTAIN, Membership.Role.PLAYER]
    )