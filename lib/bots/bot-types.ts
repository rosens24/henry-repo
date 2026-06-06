import type { BotConnectorName, BotConnectorStatus } from "@/lib/agent/types";
import type { ActionResult, UserRole } from "@/lib/actions/action-types";

export type BotConnectorContext = {
  actorRole: UserRole;
  dryRun: boolean;
  mockMode: true;
};

export type BotConnector = {
  name: BotConnectorName;
  status: () => BotConnectorStatus;
  readOnly: (context: BotConnectorContext) => Promise<ActionResultLike>;
  draft: (context: BotConnectorContext, input: string) => Promise<ActionResultLike>;
  execute: (context: BotConnectorContext, input: string) => Promise<ActionResultLike>;
};

export type ActionResultLike = Pick<ActionResult, "status" | "confirmationRequired" | "summary" | "dataLabel"> & {
  connector: BotConnectorName;
};
