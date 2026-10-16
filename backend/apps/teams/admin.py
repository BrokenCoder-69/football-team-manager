from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import Membership, Team


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    autocomplete_fields = ["user"]


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "invite_code", "created_by", "archived_at"]
    search_fields = ["name", "location"]
    inlines = [MembershipInline]


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "team", "role", "status", "jersey_number"]
    list_filter = ["role", "status"]
    search_fields = ["user__name", "user__email", "team__name"]