from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Membership, Team

Role = Membership.Role
Status = Membership.Status


def make_user(name):
    return User.objects.create_user(
        email=f"{name.lower()}@example.com", name=name, password="turf-night-2026"
    )


def make_team(name, owner):
    team = Team.objects.create(name=name, created_by=owner)
    add_member(team, owner, Role.OWNER)
    return team


def add_member(team, user, role=Role.PLAYER, status_=Status.ACTIVE):
    return Membership.objects.create(
        team=team,
        user=user,
        role=role,
        status=status_,
        joined_at=timezone.now() if status_ == Status.ACTIVE else None,
    )


class TeamCreationTests(APITestCase):
    def test_creator_becomes_owner(self):
        rafi = make_user("Rafi")
        self.client.force_authenticate(rafi)
        response = self.client.post(reverse("team-list"), {"name": "Friday FC"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["my_role"], Role.OWNER)
        self.assertEqual(len(response.data["invite_code"]), 8)
        membership = Membership.objects.get(team_id=response.data["id"], user=rafi)
        self.assertEqual(membership.status, Status.ACTIVE)

    def test_anonymous_cannot_create_or_list(self):
        self.assertEqual(self.client.get(reverse("team-list")).status_code, 401)
        self.assertEqual(self.client.post(reverse("team-list"), {"name": "X"}).status_code, 401)


class TeamIsolationTests(APITestCase):
    """A member of Team A must not be able to see or touch Team B."""

    def setUp(self):
        self.rafi = make_user("Rafi")
        self.tanvir = make_user("Tanvir")
        self.team_a = make_team("Team A", self.rafi)
        self.team_b = make_team("Team B", self.tanvir)
        self.tanvir_in_b = Membership.objects.get(team=self.team_b, user=self.tanvir)
        self.client.force_authenticate(self.rafi)

    def test_list_only_shows_my_teams(self):
        response = self.client.get(reverse("team-list"))
        names = [team["name"] for team in response.data["results"]]
        self.assertEqual(names, ["Team A"])

    def test_other_team_looks_like_it_does_not_exist(self):
        urls = [
            reverse("team-detail", args=[self.team_b.id]),
            reverse("member-list", args=[self.team_b.id]),
            reverse("member-detail", args=[self.team_b.id, self.tanvir_in_b.id]),
        ]
        for url in urls:
            self.assertEqual(self.client.get(url).status_code, 404, url)

    def test_cannot_change_other_team(self):
        url = reverse("team-detail", args=[self.team_b.id])
        self.assertEqual(self.client.patch(url, {"name": "Hacked"}).status_code, 404)
        self.assertEqual(self.client.delete(url).status_code, 404)
        url = reverse("member-remove", args=[self.team_b.id, self.tanvir_in_b.id])
        self.assertEqual(self.client.post(url).status_code, 404)
        self.team_b.refresh_from_db()
        self.assertEqual(self.team_b.name, "Team B")
        self.assertIsNone(self.team_b.archived_at)

    def test_cannot_reach_other_teams_member_through_my_team_url(self):
        # My team id in the URL, but a membership id that belongs to Team B.
        url = reverse("member-remove", args=[self.team_a.id, self.tanvir_in_b.id])
        self.assertEqual(self.client.post(url).status_code, 404)

    def test_pending_or_removed_members_have_no_access(self):
        sayeed = make_user("Sayeed")
        membership = add_member(self.team_a, sayeed, status_=Status.PENDING)
        self.client.force_authenticate(sayeed)
        url = reverse("member-list", args=[self.team_a.id])
        self.assertEqual(self.client.get(url).status_code, 404)

        membership.status = Status.REMOVED
        membership.save()
        self.assertEqual(self.client.get(url).status_code, 404)


class JoinFlowTests(APITestCase):
    def setUp(self):
        self.rafi = make_user("Rafi")
        self.team = make_team("Friday FC", self.rafi)
        self.faiyaz = make_user("Faiyaz")

    def join(self, user, code=None):
        self.client.force_authenticate(user)
        return self.client.post(reverse("team-join"), {"invite_code": code or self.team.invite_code})

    def test_join_then_approve(self):
        response = self.join(self.faiyaz, self.team.invite_code.lower())  # any casing works
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Status.PENDING)
        membership = Membership.objects.get(team=self.team, user=self.faiyaz)

        # Asking twice doesn't create a second request.
        self.assertEqual(self.join(self.faiyaz).status_code, status.HTTP_200_OK)
        self.assertEqual(Membership.objects.filter(user=self.faiyaz).count(), 1)

        self.client.force_authenticate(self.rafi)
        pending = self.client.get(reverse("member-list", args=[self.team.id]), {"status": "pending"})
        self.assertEqual(len(pending.data["results"]), 1)

        response = self.client.post(reverse("member-approve", args=[self.team.id, membership.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Status.ACTIVE)

        self.client.force_authenticate(self.faiyaz)
        response = self.client.get(reverse("team-detail", args=[self.team.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["my_role"], Role.PLAYER)
        self.assertIsNone(response.data["invite_code"])  # players don't see the code

    def test_wrong_code(self):
        self.assertEqual(self.join(self.faiyaz, "ZZZZZZZZ").status_code, 400)

    def test_already_a_member(self):
        self.assertEqual(self.join(self.rafi).status_code, 400)

    def test_rejected_player_can_ask_again(self):
        membership = add_member(self.team, self.faiyaz, status_=Status.PENDING)
        self.client.force_authenticate(self.rafi)
        response = self.client.post(reverse("member-reject", args=[self.team.id, membership.id]))
        self.assertEqual(response.data["status"], Status.REJECTED)

        self.assertEqual(self.join(self.faiyaz).status_code, status.HTTP_200_OK)
        membership.refresh_from_db()
        self.assertEqual(membership.status, Status.PENDING)

    def test_removed_admin_rejoins_as_plain_player(self):
        membership = add_member(self.team, self.faiyaz, Role.ADMIN)
        self.client.force_authenticate(self.rafi)
        self.client.post(reverse("member-remove", args=[self.team.id, membership.id]))
        self.join(self.faiyaz)
        membership.refresh_from_db()
        self.assertEqual((membership.status, membership.role), (Status.PENDING, Role.PLAYER))

    def test_old_code_stops_working_after_regenerating(self):
        old_code = self.team.invite_code
        self.client.force_authenticate(self.rafi)
        response = self.client.post(reverse("team-regenerate-invite", args=[self.team.id]))
        self.assertNotEqual(response.data["invite_code"], old_code)
        self.assertEqual(self.join(self.faiyaz, old_code).status_code, 400)


class RolePermissionTests(APITestCase):
    def setUp(self):
        self.owner = make_user("Owner")
        self.team = make_team("Friday FC", self.owner)
        self.admin = make_user("Admin")
        self.captain = make_user("Captain")
        self.player = make_user("Player")
        self.other = make_user("Other")
        self.m_owner = Membership.objects.get(team=self.team, user=self.owner)
        self.m_admin = add_member(self.team, self.admin, Role.ADMIN)
        self.m_captain = add_member(self.team, self.captain, Role.CAPTAIN)
        self.m_player = add_member(self.team, self.player)
        self.m_other = add_member(self.team, self.other)

    def post(self, user, name, member, data=None):
        self.client.force_authenticate(user)
        return self.client.post(reverse(name, args=[self.team.id, member.id]), data or {})

    def test_player_cannot_manage_anything(self):
        pending = add_member(self.team, make_user("Newbie"), status_=Status.PENDING)
        self.assertEqual(self.post(self.player, "member-approve", pending).status_code, 403)
        self.assertEqual(self.post(self.player, "member-remove", self.m_other).status_code, 403)
        self.assertEqual(
            self.post(self.player, "member-role", self.m_other, {"role": "captain"}).status_code, 403
        )
        self.client.force_authenticate(self.player)
        team_url = reverse("team-detail", args=[self.team.id])
        self.assertEqual(self.client.patch(team_url, {"name": "Mine"}).status_code, 403)
        self.assertEqual(self.client.delete(team_url).status_code, 403)
        members_url = reverse("member-list", args=[self.team.id])
        self.assertEqual(self.client.get(members_url, {"status": "pending"}).status_code, 403)

    def test_player_edits_own_profile_but_not_others(self):
        self.client.force_authenticate(self.player)
        own = reverse("member-detail", args=[self.team.id, self.m_player.id])
        response = self.client.patch(own, {"jersey_number": 10, "role": "owner"})
        self.assertEqual(response.status_code, 200)
        self.m_player.refresh_from_db()
        self.assertEqual(self.m_player.jersey_number, 10)
        self.assertEqual(self.m_player.role, Role.PLAYER)  # role can't be changed here

        other = reverse("member-detail", args=[self.team.id, self.m_other.id])
        self.assertEqual(self.client.patch(other, {"jersey_number": 9}).status_code, 403)

    def test_player_can_leave(self):
        self.client.force_authenticate(self.player)
        response = self.client.post(reverse("team-leave", args=[self.team.id]))
        self.assertEqual(response.status_code, 204)
        self.m_player.refresh_from_db()
        self.assertEqual(self.m_player.status, Status.LEFT)

    def test_captain_runs_the_squad_but_not_the_team(self):
        pending = add_member(self.team, make_user("Newbie"), status_=Status.PENDING)
        self.assertEqual(self.post(self.captain, "member-approve", pending).status_code, 200)
        self.assertEqual(self.post(self.captain, "member-remove", self.m_player).status_code, 200)
        self.assertEqual(self.post(self.captain, "member-remove", self.m_admin).status_code, 403)
        self.assertEqual(self.post(self.captain, "member-remove", self.m_owner).status_code, 403)
        self.assertEqual(
            self.post(self.captain, "member-role", self.m_other, {"role": "captain"}).status_code, 403
        )
        self.client.force_authenticate(self.captain)
        team_url = reverse("team-detail", args=[self.team.id])
        self.assertEqual(self.client.patch(team_url, {"name": "Mine"}).status_code, 403)
        self.assertEqual(self.client.get(team_url).data["invite_code"], self.team.invite_code)

    def test_admin_limits(self):
        response = self.post(self.admin, "member-role", self.m_player, {"role": "captain"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["role"], Role.CAPTAIN)
        self.assertEqual(
            self.post(self.admin, "member-role", self.m_other, {"role": "admin"}).status_code, 403
        )
        self.assertEqual(
            self.post(self.admin, "member-role", self.m_owner, {"role": "player"}).status_code, 403
        )
        self.assertEqual(self.post(self.admin, "member-remove", self.m_owner).status_code, 403)
        self.client.force_authenticate(self.admin)
        team_url = reverse("team-detail", args=[self.team.id])
        self.assertEqual(self.client.patch(team_url, {"location": "Bashundhara"}).status_code, 200)
        self.assertEqual(self.client.delete(team_url).status_code, 403)

    def test_owner_powers_and_archiving(self):
        response = self.post(self.owner, "member-role", self.m_player, {"role": "admin"})
        self.assertEqual(response.data["role"], Role.ADMIN)
        # "owner" can never be handed out through this endpoint.
        self.assertEqual(
            self.post(self.owner, "member-role", self.m_other, {"role": "owner"}).status_code, 400
        )
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(reverse("team-leave", args=[self.team.id])).status_code, 400)

        # Deleting archives the team: it disappears but the data is kept.
        team_url = reverse("team-detail", args=[self.team.id])
        self.assertEqual(self.client.delete(team_url).status_code, 204)
        self.team.refresh_from_db()
        self.assertIsNotNone(self.team.archived_at)
        self.assertEqual(self.client.get(reverse("team-list")).data["count"], 0)
        self.assertEqual(self.client.get(team_url).status_code, 404)