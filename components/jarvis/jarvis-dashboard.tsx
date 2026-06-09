"use client";

import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, Building2, ClipboardList, HeartPulse, LayoutDashboard, Mic2, Plus, Radio, Save, Trash2 } from "lucide-react";
import { ApprovalModal } from "@/components/jarvis/approval-modal";
import { CommandInput } from "@/components/jarvis/command-input";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JarvisOrb } from "@/components/jarvis/jarvis-orb";
import { SettingsPanel, type DashboardTheme } from "@/components/dashboard/settings-panel";
import { StartupAnimation } from "@/components/jarvis/startup-animation";
import { RealtimeVoiceControl } from "@/components/voice/realtime-voice-control";
import { VoiceControl } from "@/components/voice/voice-control";
import { initialMessages } from "@/lib/mock-data/dashboard";
import { defaultBusinessData, getCedarNeckDealGoal, getCleanzCrmGoal, parseListInput, type BusinessData, type CedarNeckDealRecord, type CleanzCompanyRecord, type HealthOperatingSystem } from "@/lib/business/business-data";
import type { ActionResult } from "@/lib/actions/action-types";
import type { AiStatus, JarvisMessage } from "@/lib/ai/types";

export function JarvisDashboard() {
  const [, setMessages] = useState<JarvisMessage[]>(initialMessages);
  const [status, setStatus] = useState<AiStatus>("idle");
  const [history, setHistory] = useState<string[]>([]);
  const [assistantName, setAssistantName] = useState("Henry IV");
  const [voiceMode, setVoiceMode] = useState(true);
  const [theme, setTheme] = useState<DashboardTheme>("neon");
  const [approvalAction, setApprovalAction] = useState<ActionResult | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData);
  const [showStartup, setShowStartup] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "cleanz-crm" | "deals" | "health" | "data" | "voice">("dashboard");
  const commandInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "thinking";

  useEffect(() => {
    async function refreshBusinessData() {
      try {
        const response = await fetch("/api/business-data");

        if (!response.ok) return;

        setBusinessData((await response.json()) as BusinessData);
      } catch {
        return;
      }
    }

    void refreshBusinessData();
  }, []);

  useEffect(() => {
    const startupTimer = window.setTimeout(() => setShowStartup(false), 2000);
    const welcomeTimer = window.setTimeout(() => {
      const welcome = "Welcome back, kind sir. Henry IV is online. XENOMORPH handoff channel is ready in local mode.";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: welcome,
          createdAt: new Date().toISOString(),
          source: "system",
        },
      ]);
    }, 2100);

    return () => {
      window.clearTimeout(startupTimer);
      window.clearTimeout(welcomeTimer);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        commandInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function submitCommand(command: string, source: "typed" | "voice") {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) {
      return;
    }

    const userMessage: JarvisMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedCommand,
      createdAt: new Date().toISOString(),
      source,
    };

    setMessages((current) => [...current, userMessage]);
    setHistory((current) => [trimmedCommand, ...current.filter((item) => item !== trimmedCommand)].slice(0, 6));
    setStatus("thinking");

    try {
      const response = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmedCommand, source, actorRole: "owner", readOnlyMode: true }),
      });

      if (!response.ok) {
        throw new Error("Henry IV API request failed.");
      }

      const result = (await response.json()) as {
        message: JarvisMessage;
        recommendedActions: ActionResult[];
        openAiBridge: { connected: boolean; content: string };
      };
      setStatus("speaking");
      setMessages((current) => [...current, result.message]);
      setApprovalAction(result.recommendedActions.find((action) => action.confirmationRequired) ?? null);
      speak(result.message.content);
      window.setTimeout(() => setStatus("idle"), 900);
    } catch {
      setStatus("idle");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Command channel is online, but the local response failed. No external systems were contacted.",
          createdAt: new Date().toISOString(),
          source: "system",
        },
      ]);
    }
  }

  function approveAction(action: ActionResult) {
    setApprovalAction(null);
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `${action.actionName} approved for owner handoff. No GitHub push or live integration will run until you request a specific commit/push target.`,
        createdAt: new Date().toISOString(),
        source: "system",
      },
    ]);
  }

  return (
    <DashboardShell theme={theme}>
      <StartupAnimation show={showStartup} />
      <ApprovalModal action={approvalAction} onClose={() => setApprovalAction(null)} onApprove={approveAction} />
      <header className="px-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-3">
        <div className="hud-panel flex flex-wrap items-center justify-between gap-3 rounded-md p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border border-yellow-300/45 bg-stone-950 shadow-[0_0_18px_rgba(250,204,21,0.22)]">
              <TrippyAiMark />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Henry IV</p>
              <p className="text-xs text-zinc-400">Cleanz, Cedar Neck, Health</p>
            </div>
          </div>
        </div>
        <nav className="mt-2 flex flex-nowrap gap-1.5 overflow-x-auto rounded-md border border-yellow-300/15 bg-black/55 p-1.5 shadow-[0_12px_38px_rgba(0,0,0,0.28)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <MenuButton
            active={activeView === "dashboard"}
            icon={<LayoutDashboard className="size-4" />}
            label="Dashboard"
            onClick={() => setActiveView("dashboard")}
          />
          <MenuButton
            active={activeView === "data"}
            icon={<ClipboardList className="size-4" />}
            label="Data"
            onClick={() => setActiveView("data")}
          />
          <MenuButton
            active={activeView === "cleanz-crm"}
            icon={<BriefcaseBusiness className="size-4" />}
            label="Cleanz CRM"
            onClick={() => setActiveView("cleanz-crm")}
          />
          <MenuButton
            active={activeView === "deals"}
            icon={<Building2 className="size-4" />}
            label="Deals"
            onClick={() => setActiveView("deals")}
          />
          <MenuButton
            active={activeView === "health"}
            icon={<HeartPulse className="size-4" />}
            label="Health"
            onClick={() => setActiveView("health")}
          />
          <MenuButton
            active={activeView === "voice"}
            icon={<Mic2 className="size-4" />}
            label="Voice + Settings"
            onClick={() => setActiveView("voice")}
          />
        </nav>
      </header>

      {activeView === "dashboard" ? (
        <DashboardView
          status={status}
          history={history}
          isLoading={isLoading}
          commandInputRef={commandInputRef}
          onSubmitCommand={submitCommand}
        />
      ) : activeView === "data" ? (
        <DataInputView key={businessData.updatedAt} businessData={businessData} onBusinessDataChange={setBusinessData} />
      ) : activeView === "cleanz-crm" ? (
        <CleanzCrmView key={`cleanz-${businessData.updatedAt}`} businessData={businessData} onBusinessDataChange={setBusinessData} />
      ) : activeView === "deals" ? (
        <CedarNeckDealsView key={`deals-${businessData.updatedAt}`} businessData={businessData} onBusinessDataChange={setBusinessData} />
      ) : activeView === "health" ? (
        <HealthOsView key={`health-${businessData.updatedAt}`} businessData={businessData} onBusinessDataChange={setBusinessData} />
      ) : (
        <VoiceSettingsView
          assistantName={assistantName}
          status={status}
          voiceMode={voiceMode}
          theme={theme}
          onAssistantNameChange={setAssistantName}
          onStatusChange={setStatus}
          onSubmitCommand={submitCommand}
          onThemeChange={setTheme}
          onVoiceModeChange={setVoiceMode}
        />
      )}

    </DashboardShell>
  );
}

type DashboardViewProps = {
  status: AiStatus;
  history: string[];
  isLoading: boolean;
  commandInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmitCommand: (command: string, source: "typed" | "voice") => void;
};

function DashboardView({ status, history, isLoading, commandInputRef, onSubmitCommand }: DashboardViewProps) {
  return (
    <main className="grid flex-1 content-start gap-2 p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <section className="hud-panel machine-core relative flex min-h-[calc(100svh-170px)] flex-col items-center justify-center overflow-hidden rounded-md p-3 sm:min-h-[calc(100svh-190px)] sm:p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.16),transparent_34%),radial-gradient(circle_at_50%_58%,rgba(244,244,245,0.10),transparent_28%)]" />
        <div className="precision-shutter" />
        <div className="radar-slice" />
        <div className="scan-beam" />
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
          <JarvisOrb status={status} />
          <div className="mt-4 w-full rounded-md border border-yellow-300/15 bg-black/55 p-3">
            <CommandInput ref={commandInputRef} onSubmit={(command) => onSubmitCommand(command, "typed")} history={history} isLoading={isLoading} />
          </div>
        </div>
      </section>
    </main>
  );
}

function DataInputView({ businessData, onBusinessDataChange }: { businessData: BusinessData; onBusinessDataChange: (data: BusinessData) => void }) {
  const [draft, setDraft] = useState<BusinessData>(businessData);
  const [saveState, setSaveState] = useState("Ready");

  async function saveBusinessData() {
    setSaveState("Saving...");

    try {
      const response = await fetch("/api/business-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error("Business data save failed.");
      }

      const saved = (await response.json()) as BusinessData;
      onBusinessDataChange(saved);
      setSaveState("Saved");
    } catch {
      setSaveState("Save failed");
    }
  }

  return (
    <main className="grid flex-1 gap-2 p-2 xl:grid-cols-[minmax(520px,1fr)_340px]">
      <HudSection title="Business Data Input">
        <div className="grid gap-2 md:grid-cols-2">
          <NumberField label="Revenue" value={draft.revenue} onChange={(revenue) => setDraft((current) => ({ ...current, revenue }))} />
          <NumberField label="New Bookings" value={draft.newBookings} onChange={(newBookings) => setDraft((current) => ({ ...current, newBookings }))} />
          <NumberField label="Missed Calls" value={draft.missedCalls} onChange={(missedCalls) => setDraft((current) => ({ ...current, missedCalls }))} />
          <NumberField label="Active Cleaners" value={draft.activeCleaners} onChange={(activeCleaners) => setDraft((current) => ({ ...current, activeCleaners }))} />
          <NumberField label="Upcoming Jobs" value={draft.upcomingJobs} onChange={(upcomingJobs) => setDraft((current) => ({ ...current, upcomingJobs }))} />
          <NumberField label="New Leads" value={draft.newLeads} onChange={(newLeads) => setDraft((current) => ({ ...current, newLeads }))} />
          <NumberField label="Open Customer Issues" value={draft.openCustomerIssues} onChange={(openCustomerIssues) => setDraft((current) => ({ ...current, openCustomerIssues }))} />
          <label className="grid gap-2 text-sm text-zinc-300">
            Cleaner Availability
            <input
              value={draft.cleanerAvailability}
              onChange={(event) => setDraft((current) => ({ ...current, cleanerAvailability: event.target.value }))}
              className="rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-yellow-200/50"
            />
          </label>
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-3">
          <ListField label="Completed Tasks" value={draft.completedTasks} onChange={(completedTasks) => setDraft((current) => ({ ...current, completedTasks }))} />
          <ListField label="Approval Needed" value={draft.approvalNeeded} onChange={(approvalNeeded) => setDraft((current) => ({ ...current, approvalNeeded }))} />
          <ListField label="Opportunities" value={draft.opportunities} onChange={(opportunities) => setDraft((current) => ({ ...current, opportunities }))} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveBusinessData}
            className="data-rail flex items-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-300/15 px-4 py-2 text-sm font-semibold text-yellow-50"
          >
            <Save className="size-4" />
            Save Data
          </button>
          <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">{saveState}</span>
        </div>
      </HudSection>
      <HudSection title="Current Source">
        <div className="grid gap-2 text-sm text-zinc-300">
          <p>This dashboard now uses owner-entered local business data saved on this machine.</p>
          <p>Last updated: <span className="text-yellow-100">{businessData.updatedAt === defaultBusinessData.updatedAt ? "Not saved yet" : businessData.updatedAt}</span></p>
          <p>Connect Stripe, Supabase, Twilio, and Gmail later to automate these fields.</p>
        </div>
      </HudSection>
    </main>
  );
}

function CleanzCrmView({ businessData, onBusinessDataChange }: { businessData: BusinessData; onBusinessDataChange: (data: BusinessData) => void }) {
  const [draft, setDraft] = useState<BusinessData>(businessData);
  const [saveState, setSaveState] = useState("Ready");
  const goal = getCleanzCrmGoal(draft);

  async function save() {
    await saveDashboardData(draft, onBusinessDataChange, setSaveState);
  }

  function addCompany() {
    const now = new Date().toISOString();
    setDraft((current) => ({
      ...current,
      cleanzCrm: [
        {
          id: crypto.randomUUID(),
          companyName: "",
          contactName: "",
          phone: "",
          email: "",
          website: "",
          status: "to_call",
          notes: "",
          nextStep: "Call and qualify cleaning needs.",
          createdAt: now,
          updatedAt: now,
        },
        ...current.cleanzCrm,
      ],
    }));
  }

  function updateCompany(id: string, patch: Partial<CleanzCompanyRecord>) {
    setDraft((current) => ({
      ...current,
      cleanzCrm: current.cleanzCrm.map((company) => company.id === id ? { ...company, ...patch, updatedAt: new Date().toISOString() } : company),
    }));
  }

  function removeCompany(id: string) {
    setDraft((current) => ({ ...current, cleanzCrm: current.cleanzCrm.filter((company) => company.id !== id) }));
  }

  return (
    <main className="grid flex-1 gap-2 p-2 xl:grid-cols-[320px_minmax(560px,1fr)]">
      <HudSection title="Cleanz Sales CRM">
        <GoalCard title="Companies called this month" goal={goal} />
        <button type="button" onClick={addCompany} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-300/15 px-4 py-2 text-sm font-semibold text-yellow-50">
          <Plus className="size-4" />
          Add Company
        </button>
        <button type="button" onClick={save} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300/25 bg-zinc-200/10 px-4 py-2 text-sm font-semibold text-zinc-50">
          <Save className="size-4" />
          Save CRM
        </button>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-400">{saveState}</p>
      </HudSection>
      <HudSection title="Call List">
        <div className="grid gap-2">
          {draft.cleanzCrm.length === 0 ? (
            <EmptyState text="Add the first company you call. Henry IV will track notes, status, and next step." />
          ) : draft.cleanzCrm.map((company) => (
            <article key={company.id} className="rounded-md border border-yellow-300/15 bg-black/45 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <TextField label="Company" value={company.companyName} onChange={(companyName) => updateCompany(company.id, { companyName })} />
                <TextField label="Contact" value={company.contactName} onChange={(contactName) => updateCompany(company.id, { contactName })} />
                <TextField label="Phone" value={company.phone} onChange={(phone) => updateCompany(company.id, { phone })} />
                <TextField label="Email" value={company.email} onChange={(email) => updateCompany(company.id, { email })} />
                <TextField label="Website" value={company.website} onChange={(website) => updateCompany(company.id, { website })} />
                <SelectField label="Status" value={company.status} options={["to_call", "called", "follow_up", "proposal", "won", "lost"]} onChange={(status) => updateCompany(company.id, { status: status as CleanzCompanyRecord["status"] })} />
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <TextAreaField label="Notes" value={company.notes} onChange={(notes) => updateCompany(company.id, { notes })} />
                <TextAreaField label="Next Step" value={company.nextStep} onChange={(nextStep) => updateCompany(company.id, { nextStep })} />
              </div>
              <button type="button" onClick={() => removeCompany(company.id)} className="mt-2 flex items-center gap-2 rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-100">
                <Trash2 className="size-3" />
                Remove
              </button>
            </article>
          ))}
        </div>
      </HudSection>
    </main>
  );
}

function CedarNeckDealsView({ businessData, onBusinessDataChange }: { businessData: BusinessData; onBusinessDataChange: (data: BusinessData) => void }) {
  const [draft, setDraft] = useState<BusinessData>(businessData);
  const [saveState, setSaveState] = useState("Ready");
  const goal = getCedarNeckDealGoal(draft);

  async function save() {
    await saveDashboardData(draft, onBusinessDataChange, setSaveState);
  }

  function addDeal() {
    const now = new Date().toISOString();
    setDraft((current) => ({
      ...current,
      cedarNeckDeals: [
        {
          id: crypto.randomUUID(),
          propertyName: "",
          address: "",
          dealType: "single_family",
          source: "",
          status: "new",
          askingPrice: 0,
          units: 1,
          notes: "",
          nextStep: "Research owner, property condition, rent upside, and motivation.",
          createdAt: now,
          updatedAt: now,
        },
        ...current.cedarNeckDeals,
      ],
    }));
  }

  function updateDeal(id: string, patch: Partial<CedarNeckDealRecord>) {
    setDraft((current) => ({
      ...current,
      cedarNeckDeals: current.cedarNeckDeals.map((deal) => deal.id === id ? { ...deal, ...patch, updatedAt: new Date().toISOString() } : deal),
    }));
  }

  function removeDeal(id: string) {
    setDraft((current) => ({ ...current, cedarNeckDeals: current.cedarNeckDeals.filter((deal) => deal.id !== id) }));
  }

  return (
    <main className="grid flex-1 gap-2 p-2 xl:grid-cols-[320px_minmax(560px,1fr)]">
      <HudSection title="Cedar Neck Deal Flow">
        <GoalCard title="Deals brought this month" goal={goal} />
        <button type="button" onClick={addDeal} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-300/15 px-4 py-2 text-sm font-semibold text-yellow-50">
          <Plus className="size-4" />
          Add Deal
        </button>
        <button type="button" onClick={save} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300/25 bg-zinc-200/10 px-4 py-2 text-sm font-semibold text-zinc-50">
          <Save className="size-4" />
          Save Deals
        </button>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-400">{saveState}</p>
      </HudSection>
      <HudSection title="Deal Board">
        <div className="grid gap-2">
          {draft.cedarNeckDeals.length === 0 ? (
            <EmptyState text="Add a single-family or multifamily opportunity. Henry IV will keep the next action clear." />
          ) : draft.cedarNeckDeals.map((deal) => (
            <article key={deal.id} className="rounded-md border border-yellow-300/15 bg-black/45 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <TextField label="Property / Lead" value={deal.propertyName} onChange={(propertyName) => updateDeal(deal.id, { propertyName })} />
                <TextField label="Address" value={deal.address} onChange={(address) => updateDeal(deal.id, { address })} />
                <SelectField label="Type" value={deal.dealType} options={["single_family", "multifamily"]} onChange={(dealType) => updateDeal(deal.id, { dealType: dealType as CedarNeckDealRecord["dealType"] })} />
                <SelectField label="Status" value={deal.status} options={["new", "researching", "contacted", "underwriting", "offer_ready", "submitted", "dead"]} onChange={(status) => updateDeal(deal.id, { status: status as CedarNeckDealRecord["status"] })} />
                <TextField label="Source" value={deal.source} onChange={(source) => updateDeal(deal.id, { source })} />
                <NumberField label="Asking Price" value={deal.askingPrice} onChange={(askingPrice) => updateDeal(deal.id, { askingPrice })} />
                <NumberField label="Units" value={deal.units} onChange={(units) => updateDeal(deal.id, { units })} />
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <TextAreaField label="Notes" value={deal.notes} onChange={(notes) => updateDeal(deal.id, { notes })} />
                <TextAreaField label="Next Step" value={deal.nextStep} onChange={(nextStep) => updateDeal(deal.id, { nextStep })} />
              </div>
              <button type="button" onClick={() => removeDeal(deal.id)} className="mt-2 flex items-center gap-2 rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-100">
                <Trash2 className="size-3" />
                Remove
              </button>
            </article>
          ))}
        </div>
      </HudSection>
    </main>
  );
}

function HealthOsView({ businessData, onBusinessDataChange }: { businessData: BusinessData; onBusinessDataChange: (data: BusinessData) => void }) {
  const [draft, setDraft] = useState<BusinessData>(businessData);
  const [saveState, setSaveState] = useState("Ready");
  const health = draft.healthOs;

  async function save() {
    await saveDashboardData(draft, onBusinessDataChange, setSaveState);
  }

  function updateHealth(patch: Partial<HealthOperatingSystem>) {
    setDraft((current) => ({ ...current, healthOs: { ...current.healthOs, ...patch } }));
  }

  return (
    <main className="grid flex-1 gap-2 p-2 xl:grid-cols-[340px_minmax(560px,1fr)]">
      <HudSection title="Health OS">
        <div className="grid gap-2 text-sm text-zinc-300">
          <p className="text-yellow-100">Simple operating rules for food, mind, body, and exercise. Henry IV can evolve this with you as your routine gets clearer.</p>
          <p>Keep it easy enough to run on busy days. The target is consistency, not a perfect-looking plan.</p>
        </div>
        <button type="button" onClick={save} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-300/15 px-4 py-2 text-sm font-semibold text-yellow-50">
          <Save className="size-4" />
          Save Health OS
        </button>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-400">{saveState}</p>
      </HudSection>
      <HudSection title="Daily Process">
        <div className="grid gap-2 lg:grid-cols-2">
          <ListField label="Food" value={health.food} onChange={(food) => updateHealth({ food })} />
          <ListField label="Mind" value={health.mind} onChange={(mind) => updateHealth({ mind })} />
          <ListField label="Body" value={health.body} onChange={(body) => updateHealth({ body })} />
          <ListField label="Exercise" value={health.exercise} onChange={(exercise) => updateHealth({ exercise })} />
          <ListField label="Daily Checklist" value={health.dailyChecklist} onChange={(dailyChecklist) => updateHealth({ dailyChecklist })} />
          <TextAreaField label="Weekly Review" value={health.weeklyReview} onChange={(weeklyReview) => updateHealth({ weeklyReview })} />
        </div>
      </HudSection>
    </main>
  );
}

async function saveDashboardData(draft: BusinessData, onBusinessDataChange: (data: BusinessData) => void, setSaveState: (state: string) => void) {
  setSaveState("Saving...");

  try {
    const response = await fetch("/api/business-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error("Dashboard data save failed.");
    }

    const saved = (await response.json()) as BusinessData;
    onBusinessDataChange(saved);
    setSaveState("Saved");
  } catch {
    setSaveState("Save failed");
  }
}

function GoalCard({ title, goal }: { title: string; goal: ReturnType<typeof getCleanzCrmGoal> }) {
  return (
    <div className="rounded-md border border-yellow-300/20 bg-black/45 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-semibold text-white">{goal.completed}</p>
        <p className="text-sm text-yellow-100">Goal {goal.currentGoal}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-yellow-300" style={{ width: `${goal.progressPercent}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-400">{goal.remaining} left. Next goal becomes {goal.nextGoalAfterHit} once this one is hit.</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-yellow-300/25 bg-black/35 p-4 text-sm text-zinc-300">{text}</div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-yellow-200/50"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 resize-y rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-yellow-200/50"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-yellow-200/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      {label}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-yellow-200/50"
      />
    </label>
  );
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      {label}
      <textarea
        value={value.join("\n")}
        onChange={(event) => onChange(parseListInput(event.target.value))}
        className="min-h-32 resize-y rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-yellow-200/50"
      />
    </label>
  );
}

type VoiceSettingsViewProps = {
  assistantName: string;
  status: AiStatus;
  voiceMode: boolean;
  theme: DashboardTheme;
  onAssistantNameChange: (name: string) => void;
  onStatusChange: (status: AiStatus) => void;
  onSubmitCommand: (command: string, source: "typed" | "voice") => void;
  onThemeChange: (theme: DashboardTheme) => void;
  onVoiceModeChange: (enabled: boolean) => void;
};

function VoiceSettingsView({
  assistantName,
  status,
  voiceMode,
  theme,
  onAssistantNameChange,
  onStatusChange,
  onSubmitCommand,
  onThemeChange,
  onVoiceModeChange,
}: VoiceSettingsViewProps) {
  return (
    <main className="grid flex-1 gap-2 p-2 xl:grid-cols-[minmax(420px,1fr)_340px]">
      <HudSection title="Voice + Settings">
        <div className="grid gap-2">
          {voiceMode ? (
            <>
              <VoiceControl status={status} onStatusChange={onStatusChange} onTranscript={(command) => onSubmitCommand(command, "voice")} />
              <RealtimeVoiceControl onStatusChange={onStatusChange} />
            </>
          ) : (
            <div className="rounded-md border border-zinc-700/50 bg-black/45 p-3 text-sm text-zinc-300">
              Voice mode is disabled in settings.
            </div>
          )}
        </div>
      </HudSection>
      <HudSection title="Control Settings">
        <SettingsPanel
          assistantName={assistantName}
          voiceMode={voiceMode}
          theme={theme}
          onAssistantNameChange={onAssistantNameChange}
          onVoiceModeChange={onVoiceModeChange}
          onThemeChange={onThemeChange}
        />
      </HudSection>
    </main>
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text.slice(0, 220));
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((voice) => voice.name.toLowerCase().includes("daniel")) ||
    voices.find((voice) => voice.name.toLowerCase().includes("microsoft guy")) ||
    voices.find((voice) => voice.lang.startsWith("en"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 0.92;
  utterance.pitch = 0.72;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

function TrippyAiMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" role="img" aria-label="Henry IV abstract logo">
      <defs>
        <linearGradient id="henry-trippy-a" x1="8" x2="40" y1="8" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="0.45" stopColor="#facc15" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="henry-trippy-b" x1="38" x2="10" y1="7" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
      </defs>
      <path d="M24 5 40 36H8L24 5Z" fill="none" stroke="url(#henry-trippy-a)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M15 35 24 13l9 22" fill="none" stroke="url(#henry-trippy-b)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 26c6-5 16-5 22 0" fill="none" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <circle cx="24" cy="25" r="5" fill="#020617" stroke="#fef3c7" strokeWidth="2" />
      <circle cx="24" cy="25" r="2" fill="#22d3ee" />
      <path d="M8 13c5-5 11-7 16-7s11 2 16 7" fill="none" stroke="#fef3c7" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
      <path d="M10 40c8 3 20 3 28 0" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function MenuButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
        active
          ? "border-yellow-300/40 bg-yellow-300/20 text-yellow-50 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
          : "border-yellow-300/10 bg-black/45 text-zinc-400 hover:border-yellow-300/30 hover:text-yellow-100"
      }`}
    >
      <span className="text-yellow-200">{icon}</span>
      {label}
    </button>
  );
}

function HudSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="hud-panel rounded-md p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="hud-title">{title}</h2>
        <Radio className="size-3 text-yellow-300" />
      </div>
      {children}
    </section>
  );
}
