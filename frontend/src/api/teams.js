import { api } from "./client";

export async function listTeams() {
  const { data } = await api.get("/teams/");
  return data.results;
}

export async function createTeam(values) {
  const { data } = await api.post("/teams/", values);
  return data;
}

export async function joinTeam(inviteCode) {
  const { data } = await api.post("/teams/join/", { invite_code: inviteCode });
  return data;
}

export async function getTeam(teamId) {
  const { data } = await api.get(`/teams/${teamId}/`);
  return data;
}

export async function leaveTeam(teamId) {
  await api.post(`/teams/${teamId}/leave/`);
}

export async function regenerateInvite(teamId) {
  const { data } = await api.post(`/teams/${teamId}/regenerate-invite/`);
  return data.invite_code;
}

export async function listMembers(teamId, status = "active") {
  const { data } = await api.get(`/teams/${teamId}/members/`, { params: { status } });
  return data.results;
}

// action is "approve", "reject", "remove" or "role"
export async function memberAction(teamId, memberId, action, body = {}) {
  const { data } = await api.post(`/teams/${teamId}/members/${memberId}/${action}/`, body);
  return data;
}