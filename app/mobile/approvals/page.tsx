import { MobileApprovalQueue, MobileSecurityPolicy } from "@/components/mobile/mobile-cards";
import { MobileShell } from "@/components/mobile/mobile-shell";

export default function MobileApprovalsPage() {
  return (
    <MobileShell title="Approvals">
      <MobileApprovalQueue />
      <MobileSecurityPolicy />
    </MobileShell>
  );
}
