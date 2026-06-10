"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, Send, ShieldAlert } from "lucide-react";

type SystemStatus = {
  aiProvider: "xai" | "gemini" | "openai" | "none";
  aiConnected: boolean;
  xaiConfigured: boolean;
  xaiConnected: boolean;
  xaiStatusCode: number;
  xaiDetail: string;
  geminiConfigured: boolean;
  geminiConnected: boolean;
  geminiStatusCode: number;
  geminiDetail: string;
  openAiConfigured: boolean;
  openAiAuthenticated: boolean;
  openAiConnected: boolean;
  openAiStatusCode: number;
  openAiDetail: string;
  generatedAt: string;
};

type TestResult = {
  provider?: string;
  connected?: boolean;
  content: string;
};

export function AiProviderStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [statusText, setStatusText] = useState("Checking AI providers...");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function refreshStatus() {
    setLoading(true);
    setStatusText("Refreshing provider status...");

    try {
      const response = await fetch("/api/system/status", { cache: "no-store" });

      if (!response.ok) throw new Error("Status request failed.");

      const nextStatus = (await response.json()) as SystemStatus;
      setStatus(nextStatus);
      setStatusText(nextStatus.aiConnected ? `Connected through ${providerLabel(nextStatus.aiProvider)}.` : "No real AI provider is connected yet.");
    } catch {
      setStatusText("Provider status check failed.");
    } finally {
      setLoading(false);
    }
  }

  async function runAgentTest() {
    setLoading(true);
    setTestResult(null);
    setStatusText("Running Henry IV live agent test...");

    try {
      const response = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "Henry IV live test: answer in one short sentence and name the active AI provider.",
          source: "typed",
          actorRole: "owner",
          readOnlyMode: true,
        }),
      });

      if (!response.ok) throw new Error("Agent test failed.");

      const result = (await response.json()) as {
        message: { content: string };
        openAiBridge?: { provider?: string; connected?: boolean };
      };
      setTestResult({
        provider: result.openAiBridge?.provider,
        connected: result.openAiBridge?.connected,
        content: result.message.content,
      });
      setStatusText("Agent test complete.");
      await refreshStatus();
    } catch {
      setStatusText("Agent test failed before a response returned.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-yellow-200" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-100">AI Provider</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{statusText}</p>
        </div>
        <button
          type="button"
          onClick={refreshStatus}
          disabled={loading}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-500/35 bg-zinc-200/10 text-zinc-100 transition hover:bg-zinc-200/15 disabled:opacity-50"
          aria-label="Refresh AI provider status"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <ProviderRow name="Grok/xAI" configured={status?.xaiConfigured} connected={status?.xaiConnected} detail={status?.xaiDetail} />
        <ProviderRow name="Gemini" configured={status?.geminiConfigured} connected={status?.geminiConnected} detail={status?.geminiDetail} />
        <ProviderRow
          name="OpenAI"
          configured={status?.openAiConfigured}
          connected={status?.openAiConnected}
          detail={status?.openAiDetail}
          extra={status?.openAiAuthenticated ? "Key authenticated" : undefined}
        />
      </div>

      <button
        type="button"
        onClick={runAgentTest}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-300/30 bg-yellow-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-yellow-50 transition hover:bg-yellow-300/18 disabled:opacity-50"
      >
        <Send className="size-4" />
        Run Live Agent Test
      </button>

      {testResult ? (
        <div className="mt-3 rounded-lg border border-yellow-300/15 bg-black/55 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-yellow-200">
            {testResult.connected ? `Connected: ${providerLabel(testResult.provider)}` : "Not Connected"}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-300">{testResult.content}</p>
        </div>
      ) : null}
    </section>
  );
}

function ProviderRow({
  name,
  configured,
  connected,
  detail,
  extra,
}: {
  name: string;
  configured?: boolean;
  connected?: boolean;
  detail?: string;
  extra?: string;
}) {
  const tone = connected ? "border-emerald-300/25 bg-emerald-300/8 text-emerald-100" : configured ? "border-amber-300/25 bg-amber-300/8 text-amber-100" : "border-zinc-600/35 bg-black/45 text-zinc-300";

  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{name}</p>
        <span className="text-[10px] uppercase tracking-[0.14em]">{connected ? "Live" : configured ? "Configured" : "Missing key"}</span>
      </div>
      {extra ? <p className="mt-1 text-[11px] opacity-80">{extra}</p> : null}
      <p className="mt-1 flex items-start gap-2 text-[11px] leading-4 opacity-80">
        {!connected ? <ShieldAlert className="mt-0.5 size-3 shrink-0" /> : null}
        {detail || "Waiting for status."}
      </p>
    </div>
  );
}

function providerLabel(provider?: string) {
  if (provider === "xai") return "Grok/xAI";
  if (provider === "gemini") return "Gemini";
  if (provider === "openai") return "OpenAI";

  return "none";
}
