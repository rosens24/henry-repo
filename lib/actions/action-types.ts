export type UserRole = "owner" | "admin" | "cleaner" | "customer";

export type ActionLevel = 1 | 2 | 3;

export type ActionStatus = "completed" | "drafted" | "blocked" | "requires_approval";

export type DataMode = "mock" | "real";

export type JarvisActionName =
  | "getTodayRevenue"
  | "getUpcomingJobs"
  | "getCleanerAvailability"
  | "getUnreadMessages"
  | "sourceRealEstateDeals"
  | "draftAcquisitionOutreach"
  | "reviewCleanzCrm"
  | "reviewHealthOs"
  | "summarizeDay"
  | "draftCustomerText"
  | "draftCleanerText"
  | "draftEmail"
  | "draftScheduleChange"
  | "draftRefundRequest"
  | "sendText"
  | "sendEmail"
  | "issueRefund"
  | "cancelBooking"
  | "updateCleanerPay"
  | "pushToGithub"
  | "changePricing";

export type AuditLogEntry = {
  id: string;
  actionName: JarvisActionName;
  status: ActionStatus;
  actorRole: UserRole;
  dataMode: DataMode;
  confirmationRequired: boolean;
  permissionRequired: UserRole[];
  message: string;
  createdAt: string;
};

export type ActionContext = {
  actorRole: UserRole;
  readOnlyMode: boolean;
  command: string;
};

export type ActionResult = {
  actionName: JarvisActionName;
  level: ActionLevel;
  status: ActionStatus;
  dataLabel: "mock data" | "real data";
  confirmationRequired: boolean;
  permissionRequired: UserRole[];
  summary: string;
  auditLogEntry: AuditLogEntry;
  payload?: unknown;
};

export type SafeAction = {
  name: JarvisActionName;
  level: ActionLevel;
  description: string;
  permissionRequired: UserRole[];
  confirmationRequired: boolean;
  run: (context: ActionContext) => Promise<ActionResult>;
};
