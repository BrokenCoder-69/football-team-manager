import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as teamsApi from "../../api/teams";

// One place that names every piece of cached team data.
export const teamKeys = {
  all: ["teams"],
  detail: (teamId) => ["teams", String(teamId)],
  members: (teamId, status) => ["teams", String(teamId), "members", status],
};

export function useTeams() {
  return useQuery({ queryKey: teamKeys.all, queryFn: teamsApi.listTeams });
}

export function useTeam(teamId) {
  return useQuery({ queryKey: teamKeys.detail(teamId), queryFn: () => teamsApi.getTeam(teamId) });
}

export function useMembers(teamId, status = "active", { enabled = true } = {}) {
  return useQuery({
    queryKey: teamKeys.members(teamId, status),
    queryFn: () => teamsApi.listMembers(teamId, status),
    enabled, // when false, nothing is fetched (e.g. players can't see join requests)
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.createTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.all }),
  });
}

export function useJoinTeam() {
  return useMutation({ mutationFn: teamsApi.joinTeam });
}

export function useMemberAction(teamId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, action, body }) =>
      teamsApi.memberAction(teamId, memberId, action, body),
    // Refreshes this team, its member lists and its member count in one go.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) }),
  });
}

export function useRegenerateInvite(teamId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamsApi.regenerateInvite(teamId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) }),
  });
}

export function useLeaveTeam(teamId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => teamsApi.leaveTeam(teamId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.all, exact: true }),
  });
}