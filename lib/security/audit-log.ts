import type { ActionResult, AuditLogEntry } from "@/lib/actions/action-types";

const auditLog: AuditLogEntry[] = [];

export function createAuditLogEntry(result: Omit<ActionResult, "auditLogEntry">): AuditLogEntry {
  return {
    id: crypto.randomUUID(),
    actionName: result.actionName,
    status: result.status,
    actorRole: "owner",
    dataMode: result.dataLabel === "mock data" ? "mock" : "real",
    confirmationRequired: result.confirmationRequired,
    permissionRequired: result.permissionRequired,
    message: result.summary,
    createdAt: new Date().toISOString(),
  };
}

export function recordAuditEntry(entry: AuditLogEntry) {
  auditLog.unshift(entry);

  return entry;
}

export function getAuditLog() {
  return auditLog.slice(0, 100);
}
