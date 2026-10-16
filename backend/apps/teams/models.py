import secrets

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q

from apps.core.models import TimeStampedModel

# No 0/O or 1/I/L, so a code read aloud or copied from a screenshot is unambiguous.
INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

hex_color = RegexValidator(r"^#[0-9A-Fa-f]{6}$", "Use a hex colour like #0B3D24.")


def generate_invite_code():
    return "".join(secrets.choice(INVITE_ALPHABET) for _ in range(8))


class Team(TimeStampedModel):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    primary_color = models.CharField(max_length=7, blank=True, validators=[hex_color])
    secondary_color = models.CharField(max_length=7, blank=True, validators=[hex_color])

    invite_code = models.CharField(max_length=8, unique=True, default=generate_invite_code)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="teams_created"
    )
    # "Deleting" a team only archives it, so payment history is never lost (design §4.2).
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Membership(TimeStampedModel):
    """
    A person's place in one team: their role there plus their player profile
    for that team. Every permission check goes through this table.
    """

    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Admin"
        CAPTAIN = "captain", "Captain"
        PLAYER = "player", "Player"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending approval"
        ACTIVE = "active", "Active"
        REJECTED = "rejected", "Join request rejected"
        REMOVED = "removed", "Removed from team"
        LEFT = "left", "Left team"

    class PlayerStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        INJURED = "injured", "Injured"
        SUSPENDED = "suspended", "Suspended"
        INACTIVE = "inactive", "Inactive"
        UNAVAILABLE = "unavailable", "Temporarily unavailable"

    class Foot(models.TextChoices):
        RIGHT = "right", "Right"
        LEFT = "left", "Left"
        BOTH = "both", "Both"

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PLAYER)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    jersey_number = models.PositiveSmallIntegerField(null=True, blank=True)
    position = models.CharField(max_length=30, blank=True)
    secondary_position = models.CharField(max_length=30, blank=True)
    preferred_foot = models.CharField(max_length=5, choices=Foot.choices, blank=True)
    player_status = models.CharField(
        max_length=12, choices=PlayerStatus.choices, default=PlayerStatus.AVAILABLE
    )
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["user__name"]
        constraints = [
            models.UniqueConstraint(fields=["team", "user"], name="one_membership_per_team"),
            models.UniqueConstraint(
                fields=["team"], condition=Q(role="owner"), name="one_owner_per_team"
            ),
        ]

    def __str__(self):
        return f"{self.user.name} in {self.team.name} ({self.role}, {self.status})"

    # --- role helpers -----------------------------------------------------
    # A higher rank can manage a lower rank; nobody manages their own rank.
    RANK = {Role.PLAYER: 0, Role.CAPTAIN: 1, Role.ADMIN: 2, Role.OWNER: 3}

    @property
    def rank(self):
        return self.RANK[self.role]

    @property
    def is_manager(self):
        """Owner, admin or captain: runs the team day to day."""
        return self.rank >= self.RANK[self.Role.CAPTAIN]

    @property
    def is_admin(self):
        """Owner or admin: can change team settings and roles."""
        return self.rank >= self.RANK[self.Role.ADMIN]

    def outranks(self, other):
        return self.rank > other.rank