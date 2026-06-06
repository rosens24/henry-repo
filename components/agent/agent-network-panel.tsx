import { getCleanzAgentNetwork } from "@/lib/agent/agent-network";

export function AgentNetworkPanel() {
  return (
    <section className="hud-panel rounded-md p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="hud-title">Active Agent Network</h2>
        <span className="text-xs text-cyan-200">9 agents</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {getCleanzAgentNetwork().map((agent) => (
          <article key={agent.name} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
              <span className={agent.health === "blocked" ? "text-xs uppercase text-amber-300" : "text-xs uppercase text-emerald-300"}>
                {agent.health}
              </span>
            </div>
            <p className="mt-2 text-xs text-cyan-100">{agent.domain}</p>
            <p className="mt-2 text-xs text-slate-400">{agent.activeMission}</p>
            <div className="mt-3 rounded-md border border-slate-700/50 bg-slate-950/45 p-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Queue</p>
              <ul className="mt-1 grid gap-1 text-xs text-slate-300">
                {agent.taskQueue.slice(0, 3).map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
