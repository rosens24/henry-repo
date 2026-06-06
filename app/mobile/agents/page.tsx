import { AgentNetworkPanel } from "@/components/agent/agent-network-panel";
import { MobileShell } from "@/components/mobile/mobile-shell";

export default function MobileAgentsPage() {
  return (
    <MobileShell title="Agents">
      <AgentNetworkPanel />
    </MobileShell>
  );
}
