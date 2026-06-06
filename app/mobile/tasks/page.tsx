import { MobileActionHistory, MobileBotStatus } from "@/components/mobile/mobile-cards";
import { MobileShell } from "@/components/mobile/mobile-shell";

export default function MobileTasksPage() {
  return (
    <MobileShell title="Tasks">
      <MobileActionHistory />
      <MobileBotStatus />
    </MobileShell>
  );
}
