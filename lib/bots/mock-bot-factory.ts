import type { BotConnector, BotConnectorContext } from "@/lib/bots/bot-types";
import type { BotConnectorName } from "@/lib/agent/types";
import { getIntegrationDetail, hasLiveIntegration } from "@/lib/integrations/live-config";

export function createMockBotConnector(name: BotConnectorName): BotConnector {
  return {
    name,
    status() {
      const live = hasLiveIntegration(name);

      return {
        name,
        mode: live ? "live" : "not_connected",
        readOnlyReady: live,
        draftReady: true,
        executionReady: false,
        permissionChecks: true,
        auditLogs: true,
        dryRun: !live,
        errorHandling: true,
        detail: getIntegrationDetail(name),
      };
    },
    async readOnly(context: BotConnectorContext) {
      const live = hasLiveIntegration(name);

      return {
        connector: name,
        status: live ? "completed" : "blocked",
        confirmationRequired: false,
        dataLabel: live ? "real data" : "mock data",
        summary: live
          ? `${name} live read-only configuration is available for ${context.actorRole}.`
          : `${name} is not connected. Add live credentials before reading real data.`,
      };
    },
    async draft(_context: BotConnectorContext, input: string) {
      return {
        connector: name,
        status: "drafted",
        confirmationRequired: false,
        dataLabel: hasLiveIntegration(name) ? "real data" : "mock data",
        summary: `${name} draft prepared locally. Nothing was sent or changed: ${input}`,
      };
    },
    async execute() {
      const live = hasLiveIntegration(name);

      return {
        connector: name,
        status: "blocked",
        confirmationRequired: true,
        dataLabel: live ? "real data" : "mock data",
        summary: live
          ? `${name} execution blocked until explicit owner approval is captured.`
          : `${name} execution blocked. Live integration credentials are not connected.`,
      };
    },
  };
}
