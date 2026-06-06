import type { JarvisActionName, UserRole } from "@/lib/actions/action-types";

const roleRank: Record<UserRole, number> = {
  customer: 0,
  cleaner: 1,
  admin: 2,
  owner: 3,
};

export const dangerousActions = new Set<JarvisActionName>([
  "sendText",
  "sendEmail",
  "issueRefund",
  "cancelBooking",
  "updateCleanerPay",
  "pushToGithub",
  "changePricing",
]);

export function hasPermission(actorRole: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.some((role) => roleRank[actorRole] >= roleRank[role]);
}

export function permissionMessage(actionName: JarvisActionName, allowedRoles: UserRole[]) {
  return `${actionName} requires ${allowedRoles.join(" or ")} permission and explicit approval before execution.`;
}
