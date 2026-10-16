export const ROLE_RANK = { player: 0, captain: 1, admin: 2, owner: 3 };
export const ROLE_LABEL = { owner: "Owner", admin: "Admin", captain: "Captain", player: "Player" };

export const isManager = (role) => ROLE_RANK[role] >= ROLE_RANK.captain;
export const isAdmin = (role) => ROLE_RANK[role] >= ROLE_RANK.admin;
export const outranks = (myRole, theirRole) => ROLE_RANK[myRole] > ROLE_RANK[theirRole];
export const assignableRoles = (myRole) =>
  ["admin", "captain", "player"].filter((role) => ROLE_RANK[role] < ROLE_RANK[myRole]);