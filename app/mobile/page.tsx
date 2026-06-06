import { MobileActionHistory, MobileApprovalQueue, MobileBriefingCards, MobileSecurityPolicy } from "@/components/mobile/mobile-cards";
import { MobileShell } from "@/components/mobile/mobile-shell";

export default function MobilePage() {
  return (
    <MobileShell title="Command mode">
      <MobileBriefingCards />
      <MobileApprovalQueue />
      <MobileActionHistory />
      <MobileSecurityPolicy />
    </MobileShell>
  );
}
