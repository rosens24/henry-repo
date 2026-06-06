"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Bot, Cpu, Database, Gauge, LayoutDashboard, Lock, Mic2, Radio, ShieldCheck, Signal, Zap } from "lucide-react";
import { AgentPanels } from "@/components/agent/agent-panels";
import { AgentNetworkPanel } from "@/components/agent/agent-network-panel";
import { BriefingTimeline } from "@/components/dashboard/briefing-timeline";
import { ApprovalModal } from "@/components/jarvis/approval-modal";
import { ChatPanel } from "@/components/jarvis/chat-panel";
import { CommandInput } from "@/components/jarvis/command-input";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JarvisOrb } from "@/components/jarvis/jarvis-orb";
import { SettingsPanel, type DashboardTheme } from "@/components/dashboard/settings-panel";
import { StartupAnimation } from "@/components/jarvis/startup-animation";
import { StatCard } from "@/components/dashboard/stat-card";
import { TalkToXenomorph } from "@/components/jarvis/talk-to-xenomorph";
import { RealtimeVoiceControl } from "@/components/voice/realtime-voice-control";
import { VoiceControl } from "@/components/voice/voice-control";
import { getDailyBriefings } from "@/lib/agent/briefing-generator";
import { initialMessages, mockDashboardMetrics } from "@/lib/mock-data/dashboard";
import type { ActionResult } from "@/lib/actions/action-types";
import type { AgentRunResult, BotConnectorStatus } from "@/lib/agent/types";
import type { AiStatus, JarvisMessage } from "@/lib/ai/types";

export function JarvisDashboard() {
  const [messages, setMessages] = useState<JarvisMessage[]>(initialMessages);
  const [status, setStatus] = useState<AiStatus>("idle");
  const [history, setHistory] = useState<string[]>([]);
  const [assistantName, setAssistantName] = useState("Henry IV");
  const [voiceMode, setVoiceMode] = useState(true);
  const [theme, setTheme] = useState<DashboardTheme>("neon");
  const [approvalAction, setApprovalAction] = useState<ActionResult | null>(null);
  const [approvedHandoffs, setApprovedHandoffs] = useState<string[]>([]);
  const [openAiStatus, setOpenAiStatus] = useState("Bridge not checked");
  const [connectorStatuses, setConnectorStatuses] = useState<BotConnectorStatus[]>(initialConnectorStatuses);
  const [agentRun, setAgentRun] = useState<AgentRunResult | null>(null);
  const [showStartup, setShowStartup] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "voice">("dashboard");
  const commandInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "thinking";

  useEffect(() => {
    async function refreshSystemStatus() {
      try {
        const response = await fetch("/api/system/status");

        if (!response.ok) return;

        const statusPayload = (await response.json()) as {
          openAiConnected: boolean;
          connectors: BotConnectorStatus[];
        };
        setConnectorStatuses(statusPayload.connectors);
        setOpenAiStatus(statusPayload.openAiConnected ? "OpenAI connected" : "OpenAI not connected");
      } catch {
        setOpenAiStatus("Status check failed");
      }
    }

    void refreshSystemStatus();
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
        agent: AgentRunResult;
        openAiBridge: { connected: boolean; content: string };
      };
      setStatus("speaking");
      setMessages((current) => [...current, result.message]);
      setAgentRun(result.agent);
      setOpenAiStatus(result.openAiBridge.connected ? "OpenAI connected" : result.openAiBridge.content);
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
          content: "Command channel is online, but the local mock response failed. No external systems were contacted.",
          createdAt: new Date().toISOString(),
          source: "system",
        },
      ]);
    }
  }

  function approveAction(action: ActionResult) {
    setApprovalAction(null);
    setApprovedHandoffs((current) => [action.actionName, ...current.filter((item) => item !== action.actionName)].slice(0, 4));
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

  function queueXenomorphMessage(message: string) {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: message,
        createdAt: new Date().toISOString(),
        source: "system",
      },
    ]);
    speak(message);
  }

  return (
    <DashboardShell theme={theme}>
      <StartupAnimation show={showStartup} />
      <ApprovalModal action={approvalAction} onClose={() => setApprovalAction(null)} onApprove={approveAction} />
      <header className="px-3 pt-3">
        <div className="hud-panel grid gap-4 rounded-md p-4 lg:grid-cols-[1.15fr_1fr_1.35fr]">
          <div className="flex items-center gap-4">
            <div className="servo-pulse flex size-14 items-center justify-center rounded-md border border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.34)]">
              <Bot className="size-7 text-cyan-100" />
            </div>
            <div>
              <p className="machine-text text-lg font-semibold uppercase tracking-[0.24em] text-white">Cleanz Command Center</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-200/70">Henry IV machine layer</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {[
              ["AI Core", "Online"],
              ["Database", "Mock"],
              ["Network", "Secure"],
              ["Uptime", "99.7%"],
            ].map(([label, value]) => (
              <div key={label} className="data-rail rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-emerald-300">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusPill icon={<Signal className="size-4" />} label="Henry IV online" value={statusLabel(status)} />
            <StatusPill icon={<ShieldCheck className="size-4" />} label="Safety" value="Approval required" />
            <StatusPill icon={<Lock className="size-4" />} label="Security" value="Mock locked" />
            <StatusPill icon={<Bot className="size-4" />} label="XENOMORPH" value={approvedHandoffs.length ? "Handoff approved" : "Ready"} />
            <StatusPill icon={<Database className="size-4" />} label="OpenAI" value={openAiStatus} />
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-slate-950/55 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <MenuButton
            active={activeView === "dashboard"}
            icon={<LayoutDashboard className="size-4" />}
            label="Dashboard"
            onClick={() => setActiveView("dashboard")}
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
          messages={messages}
          status={status}
          history={history}
          isLoading={isLoading}
          commandInputRef={commandInputRef}
          onSubmitCommand={submitCommand}
          connectorStatuses={connectorStatuses}
        />
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

      <section className="px-3 pb-3">
        <TalkToXenomorph onQueued={queueXenomorphMessage} />
      </section>

      <section className="px-3 pb-3">
        <AgentNetworkPanel />
      </section>

      <section className="px-5 pb-5 sm:px-8 lg:px-10">
        <AgentPanels agent={agentRun} />
      </section>
    </DashboardShell>
  );
}

const initialConnectorStatuses: BotConnectorStatus[] = (["gmail", "calendar", "stripe", "twilio", "supabase", "github", "vercel", "cloudflare"] as const).map((name) => ({
  name,
  mode: "not_connected",
  readOnlyReady: false,
  draftReady: false,
  executionReady: false,
  permissionChecks: true,
  auditLogs: true,
  dryRun: true,
  errorHandling: true,
  detail: "Status has not loaded yet.",
}));

type DashboardViewProps = {
  messages: JarvisMessage[];
  status: AiStatus;
  history: string[];
  isLoading: boolean;
  commandInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmitCommand: (command: string, source: "typed" | "voice") => void;
  connectorStatuses: BotConnectorStatus[];
};

function DashboardView({ messages, status, history, isLoading, commandInputRef, onSubmitCommand, connectorStatuses }: DashboardViewProps) {
  return (
    <>
      <main className="grid flex-1 grid-cols-1 gap-3 p-3 xl:grid-cols-[300px_minmax(520px,1fr)_360px]">
        <section className="grid content-start gap-3">
          <HudSection title="System Overview">
            <div className="grid gap-2">
              {mockDashboardMetrics.map((metric) => (
                <StatCard key={metric.id} metric={metric} />
              ))}
            </div>
          </HudSection>
          <HudSection title="Machine State">
            <MachineStatusRail status={status} />
          </HudSection>
        </section>

        <section className="grid content-start gap-3">
          <section className="hud-panel machine-core relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-md p-4 xl:min-h-[720px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_64%_50%,rgba(16,185,129,0.1),transparent_28%)]" />
            <div className="scan-beam" />
            <motion.div
              className="absolute top-4 left-4 z-10 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100"
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <p className="hud-title">Neural Bus</p>
              <p className="mt-1 text-emerald-300">Synchronized</p>
            </motion.div>
            <div className="absolute top-28 right-8 z-10 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100">
              <p className="hud-title">Dispatch Engine</p>
              <p className="mt-1">Operational</p>
            </div>
            <div className="absolute bottom-28 left-10 z-10 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100">
              <p className="hud-title">Field Ops</p>
              <p className="mt-1">18 units tracked</p>
            </div>
            <div className="absolute bottom-28 right-10 z-10 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100">
              <p className="hud-title">Comms Relay</p>
              <p className="mt-1">Read-only</p>
            </div>
            <JarvisOrb status={status} />
            <div className="hud-divider relative z-10 mt-2 w-full max-w-2xl" />
            <div className="machine-text relative z-10 mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
              <Activity className="size-4" />
              Henry IV core active - read-only mode
            </div>
            <BriefingTimeline />
          </section>
        </section>

        <section className="grid content-start gap-3">
          <HudSection title="Command Console">
            <ChatPanel messages={messages} isLoading={isLoading} />
            <div className="mt-3">
              <CommandInput ref={commandInputRef} onSubmit={(command) => onSubmitCommand(command, "typed")} history={history} isLoading={isLoading} />
            </div>
          </HudSection>
          <HudSection title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              {["Run Health Check", "Generate Report", "Find Opportunities", "Check Schedule", "Scan For Issues", "Sync All Data"].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onSubmitCommand(`Henry IV, ${action}`, "typed")}
                  className="data-rail flex min-h-16 items-center justify-between rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-50 transition hover:border-emerald-300/45 hover:bg-emerald-300/10"
                >
                  {action}
                  <Zap className="size-3 shrink-0 text-cyan-200" />
                </button>
              ))}
            </div>
          </HudSection>
          <HudSection title="Daily Briefing">
            <div className="grid gap-3">
              {getDailyBriefings().map((briefing) => (
                <div key={briefing.id} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-white">{briefing.title}</p>
                    <span className="text-[10px] uppercase text-emerald-300">{briefing.period === "nightly" ? "Upcoming" : "Completed"}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{briefing.scheduledFor} - {briefing.dataLabel}</p>
                </div>
              ))}
            </div>
          </HudSection>
          <HudSection title="Pending Approvals">
            <ApprovalQueue />
          </HudSection>
          <HudSection title="Recent Actions">
            <RecentActions />
          </HudSection>
          <HudSection title="Opportunities">
            <Opportunities />
          </HudSection>
        </section>
      </main>

      <section className="grid gap-3 px-3 pb-3 xl:grid-cols-[1fr_1fr]">
        <HudSection title="Integrations">
          <IntegrationList connectors={connectorStatuses} />
        </HudSection>
        <HudSection title="AI Status">
          <SystemStatus />
        </HudSection>
      </section>
    </>
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
    <main className="grid flex-1 gap-3 p-3 xl:grid-cols-[minmax(420px,1fr)_360px]">
      <HudSection title="Voice + Settings">
        <div className="grid gap-3">
          {voiceMode ? (
            <>
              <RealtimeVoiceControl onStatusChange={onStatusChange} />
              <VoiceControl status={status} onStatusChange={onStatusChange} onTranscript={(command) => onSubmitCommand(command, "voice")} />
            </>
          ) : (
            <div className="rounded-md border border-slate-700/50 bg-slate-950/45 p-4 text-sm text-slate-300">
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

function StatusPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/55 px-3 py-2">
      <span className="text-cyan-200">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="text-xs font-semibold uppercase text-cyan-100">{value}</p>
      </div>
    </div>
  );
}

function MenuButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        active
          ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
          : "border-cyan-300/10 bg-slate-950/45 text-slate-400 hover:border-cyan-300/30 hover:text-cyan-100"
      }`}
    >
      <span className="text-cyan-200">{icon}</span>
      {label}
    </button>
  );
}

function HudSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="hud-panel rounded-md p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="hud-title">{title}</h2>
        <Radio className="size-3 text-cyan-300" />
      </div>
      {children}
    </section>
  );
}

function SystemStatus() {
  return (
    <div className="grid gap-2">
      {["AI Core", "Database", "API Gateway", "Integrations", "Web Services"].map((item) => (
        <div key={item} className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-300"><span className="size-2 rounded-full bg-emerald-300" />{item}</span>
          <span className="text-emerald-300">Operational</span>
        </div>
      ))}
    </div>
  );
}

function MachineStatusRail({ status }: { status: AiStatus }) {
  const statusItems = [
    { label: "Core Temp", value: "Nominal", icon: Cpu },
    { label: "Signal", value: statusLabel(status), icon: Signal },
    { label: "Load", value: status === "thinking" ? "Processing" : "Stable", icon: Gauge },
  ];

  return (
    <div className="grid gap-2">
      {statusItems.map(({ label, value, icon: Icon }, index) => (
        <div key={label} className="data-rail rounded-md border border-cyan-300/15 bg-slate-950/50 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              <Icon className="size-4 text-cyan-200" />
              {label}
            </span>
            <span className="text-xs font-semibold uppercase text-emerald-300">{value}</span>
          </div>
          <div className="mt-3 flex h-1.5 gap-1">
            {[0, 1, 2, 3, 4, 5].map((segment) => (
              <span
                key={segment}
                className="h-full flex-1 rounded-full bg-cyan-300/70 shadow-[0_0_10px_rgba(34,211,238,0.42)]"
                style={{ opacity: 0.32 + (((segment + index) % 4) + 1) * 0.16 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IntegrationList({ connectors }: { connectors: BotConnectorStatus[] }) {
  return (
    <div className="grid gap-2">
      {connectors.map((bot) => (
        <div key={bot.name} className="flex items-center justify-between rounded-md border border-slate-700/50 bg-slate-950/45 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-slate-200"><Database className="size-3 text-cyan-200" />{bot.name}</span>
          <span className={bot.mode === "live" ? "text-emerald-300" : "text-slate-500"}>{bot.mode === "live" ? "Live" : "Not connected"}</span>
        </div>
      ))}
    </div>
  );
}

function ApprovalQueue() {
  return (
    <div className="grid gap-2">
      {["Send 23 texts to cleaners", "Send follow-up to 6 leads", "Update pricing for 2 services", "Issue refund to #1042"].map((item) => (
        <div key={item} className="rounded-md border border-amber-300/20 bg-amber-300/8 px-3 py-2 text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <span>{item}</span>
            <span className="text-amber-300">Approval</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActions() {
  return (
    <div className="grid gap-2">
      {["Generated midday briefing", "Scanned for new leads", "Detected 3 open issues", "Prepared cleaner payroll"].map((item) => (
        <div key={item} className="rounded-md border border-cyan-300/15 bg-cyan-300/5 px-3 py-2 text-xs text-slate-300">{item}</div>
      ))}
    </div>
  );
}

function Opportunities() {
  return (
    <div className="grid gap-2">
      {["5 leads haven't responded", "3 jobs need cleaner coverage", "7 customers due for follow up", "4 reviews need responses"].map((item) => (
        <div key={item} className="rounded-md border border-fuchsia-300/20 bg-fuchsia-400/8 px-3 py-2 text-xs text-slate-200">{item}</div>
      ))}
    </div>
  );
}

function statusLabel(status: AiStatus) {
  const labels: Record<AiStatus, string> = {
    idle: "Idle",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
  };

  return labels[status];
}
