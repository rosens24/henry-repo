import { MobileActionHistory, MobileApprovalQueue, MobileBriefingCards, MobileSecurityPolicy } from "@/components/mobile/mobile-cards";
import { MobileCommandCenter } from "@/components/mobile/mobile-command-center";
import { MobileShell } from "@/components/mobile/mobile-shell";

export default function MobilePage() {
  return (
    <MobileShell title="Command mode">
      <MobileCommandCenter />
      <MobileBriefingCards />
      <MobileApprovalQueue />
      <MobileActionHistory />
      <MobileSecurityPolicy />
    </MobileShell>
  );
}
