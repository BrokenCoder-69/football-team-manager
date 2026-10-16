from django.urls import path

from . import views

urlpatterns = [
    path("", views.TeamListCreateView.as_view(), name="team-list"),
    path("join/", views.JoinTeamView.as_view(), name="team-join"),
    path("<int:team_id>/", views.TeamDetailView.as_view(), name="team-detail"),
    path("<int:team_id>/leave/", views.LeaveTeamView.as_view(), name="team-leave"),
    path("<int:team_id>/regenerate-invite/", views.RegenerateInviteView.as_view(), name="team-regenerate-invite"),
    path("<int:team_id>/members/", views.MemberListView.as_view(), name="member-list"),
    path("<int:team_id>/members/<int:member_id>/", views.MemberDetailView.as_view(), name="member-detail"),
    path("<int:team_id>/members/<int:member_id>/approve/", views.ApproveMemberView.as_view(), name="member-approve"),
    path("<int:team_id>/members/<int:member_id>/reject/", views.RejectMemberView.as_view(), name="member-reject"),
    path("<int:team_id>/members/<int:member_id>/remove/", views.RemoveMemberView.as_view(), name="member-remove"),
    path("<int:team_id>/members/<int:member_id>/role/", views.ChangeRoleView.as_view(), name="member-role"),
]