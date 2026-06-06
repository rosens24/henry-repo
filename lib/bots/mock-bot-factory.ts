import type { BotConnector, BotConnectorContext } from "@/lib/bots/bot-types";
import type { BotConnectorName } from "@/lib/agent/types";

export function createMockBotConnector(name: BotConnectorName): BotConnector {
  return {
    name,
    status() {
      return {
        name,
        mode: "mock",
        readOnlyReady: true,
        draftReady: true,
        executionReady: false,
        permissionChecks: true,
        auditLogs: true,
        dryRun: true,
        errorHandling: true,
        detail: `${name} bot is mock-only. Real credentials are not connected.`,
      };
    },
    async readOnly(context: BotConnectorContext) {
      return {
        connector: name,
        status: "completed",
        confirmationRequired: false,
        dataLabel: "mock data",
        summary: `${name} read-only mock check completed for ${context.actorRole}.`,
      };
    },
    async draft(_context: BotConnectorContext, input: string) {
      return {
        connector: name,
        status: "drafted",
        confirmationRequired: false,
        dataLabel: "mock data",
        summary: `${name} draft prepared in mock mode: ${input}`,
      };
    },
    async execute() {
      return {
        connector: name,
        status: "blocked",
        confirmationRequired: true,
        dataLabel: "mock data",
        summary: `${name} execution blocked. Approval and real integration are required.`,
      };
    },
  };
}
