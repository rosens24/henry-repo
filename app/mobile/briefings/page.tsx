import { MobileBriefingCards } from "@/components/mobile/mobile-cards";
import { MobileShell } from "@/components/mobile/mobile-shell";

export default function MobileBriefingsPage() {
  return (
    <MobileShell title="Briefings">
      <MobileBriefingCards />
    </MobileShell>
  );
}
