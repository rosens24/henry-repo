import type { AgentRunResult } from "@/lib/agent/types";

type AgentPanelsProps = {
  agent: AgentRunResult | null;
};

export function AgentPanels({ agent }: AgentPanelsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <Panel title="Current Mission">
        {agent ? (
          <div className="space-y-2">
            <p className="text-sm text-white">{agent.mission.command}</p>
            <p className="text-xs text-zinc-400">{agent.mission.type} - {agent.mission.toolRoute.toolName}</p>
            <div className="grid gap-2">
              {agent.mission.plan.map((step) => (
                <div key={step.id} className="rounded-lg border border-zinc-600/35 bg-black/40 p-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-100">{step.label}</p>
                  <p className="mt-1 text-xs text-zinc-400">{step.status}: {step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty text="No mission yet. Issue a command to start the agent loop." />
        )}
      </Panel>

      <Panel title="Pending Approvals">
        {agent && agent.pendingApprovals.length > 0 ? (
          <div className="grid gap-2">
            {agent.pendingApprovals.map((approval) => (
              <div key={approval.id} className="rounded-lg border border-amber-200/25 bg-amber-300/10 p-2">
                <p className="text-sm font-semibold text-amber-50">{approval.actionName}</p>
                <p className="mt-1 text-xs text-amber-100/80">{approval.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No approvals pending." />
        )}
      </Panel>

      <Panel title="Security Mode">
        {agent ? (
          <div className="grid gap-2 text-sm text-zinc-300">
            <p>Mode: <span className="text-yellow-100">{agent.securityMode.mode}</span></p>
            <p>Actor: <span className="text-yellow-100">{agent.securityMode.actorRole}</span></p>
            <p>Read-only: <span className="text-yellow-100">{agent.securityMode.readOnlyMode ? "on" : "off"}</span></p>
            <p>Destructive autonomy: <span className="text-red-200">never allowed</span></p>
          </div>
        ) : (
          <Empty text="Read-only mode is active by default." />
        )}
      </Panel>

      <Panel title="Recent Actions">
        {agent && agent.actions.length > 0 ? (
          <div className="grid gap-2">
            {agent.actions.map((action) => (
              <div key={action.auditLogEntry.id} className="rounded-lg border border-yellow-300/15 bg-yellow-400/5 p-2">
                <p className="text-sm text-white">{action.actionName}</p>
                <p className="mt-1 text-xs text-zinc-400">{action.status} - {action.dataLabel}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No recent action dry-runs." />
        )}
      </Panel>

      <Panel title="System Logs">
        {agent && agent.executionLogs.length > 0 ? (
          <div className="grid gap-2">
            {agent.executionLogs.map((log) => (
              <p key={log.id} className="rounded-lg border border-zinc-600/35 bg-black/40 p-2 text-xs text-zinc-300">
                {log.level}: {log.message}
              </p>
            ))}
          </div>
        ) : (
          <Empty text="Logs will appear after an agent run." />
        )}
      </Panel>

      <Panel title="Scheduled Automations">
        {agent ? (
          <div className="grid gap-2">
            {agent.scheduledAutomations.map((automation) => (
              <div key={automation.id} className="rounded-lg border border-zinc-600/35 bg-black/40 p-2">
                <p className="text-sm text-white">{automation.name}</p>
                <p className="mt-1 text-xs text-zinc-400">{automation.status} - {automation.cadence}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Automation placeholders load after first command." />
        )}
      </Panel>

      <Panel title="Tool Status">
        {agent ? (
          <div className="grid gap-2">
            {agent.toolStatus.map((tool) => (
              <div key={tool.name} className="rounded-lg border border-zinc-600/35 bg-black/40 p-2">
                <p className="text-sm text-white">{tool.name}: <span className="text-yellow-100">{tool.status}</span></p>
                <p className="mt-1 text-xs text-zinc-400">{tool.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Tools are in mock/blocked state until integrations are approved." />
        )}
      </Panel>

      <Panel title="Daily Briefings">
        {agent ? (
          <div className="grid gap-2">
            {agent.briefings.map((briefing) => (
              <div key={briefing.id} className="rounded-lg border border-yellow-300/15 bg-yellow-400/5 p-2">
                <p className="text-sm text-white">{briefing.title}</p>
                <p className="mt-1 text-xs text-zinc-400">{briefing.scheduledFor} - {briefing.dataLabel}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Morning, midday, and nightly briefings are mock scheduled." />
        )}
      </Panel>

      <Panel title="Bot Access">
        {agent ? (
          <div className="grid gap-2">
            {agent.botConnectors.map((bot) => (
              <div key={bot.name} className="rounded-lg border border-zinc-600/35 bg-black/40 p-2">
                <p className="text-sm text-white">{bot.name}: <span className="text-yellow-100">{bot.mode}</span></p>
                <p className="mt-1 text-xs text-zinc-400">{bot.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Bot connectors are mock-only and execution-blocked." />
        )}
      </Panel>

      <Panel title="Agent Network">
        {agent ? (
          <div className="grid gap-2">
            {agent.agentNetwork.map((networkAgent) => (
              <div key={networkAgent.name} className="rounded-lg border border-yellow-300/15 bg-yellow-400/5 p-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{networkAgent.name}</p>
                  <span className={networkAgent.health === "blocked" ? "text-xs text-amber-200" : "text-xs text-zinc-100"}>
                    {networkAgent.health}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{networkAgent.activeMission}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Agent network loads after first command." />
        )}
      </Panel>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-100">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-zinc-400">{text}</p>;
}
