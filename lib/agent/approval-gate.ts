import type { PendingApproval } from "@/lib/agent/types";
import type { JarvisActionName, UserRole } from "@/lib/actions/action-types";

export function createPendingApprovals(
  missionId: string,
  actionNames: JarvisActionName[],
  permissionRequired: UserRole[] = ["owner"],
): PendingApproval[] {
  return actionNames.map((actionName) => ({
    id: crypto.randomUUID(),
    missionId,
    actionName,
    permissionRequired,
    reason: `${actionName} is sensitive. Human approval is required before real execution.`,
    createdAt: new Date().toISOString(),
  }));
}
