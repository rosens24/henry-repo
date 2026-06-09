"use client";

import { useRef, useState } from "react";
import { Headphones, Mic, MicOff, Radio, ShieldCheck, Volume2 } from "lucide-react";
import type { AiStatus } from "@/lib/ai/types";

type RealtimeVoiceControlProps = {
  onStatusChange?: (status: AiStatus) => void;
};

type RealtimeState = "idle" | "connecting" | "live" | "blocked" | "error";

type RealtimeEvent = {
  type?: string;
  transcript?: string;
  text?: string;
  delta?: string;
  item?: {
    role?: "user" | "assistant" | "system";
    content?: Array<{ transcript?: string; text?: string }>;
  };
  response?: {
    output?: Array<{ content?: Array<{ transcript?: string; text?: string }> }>;
  };
  error?: { message?: string };
};

export function RealtimeVoiceControl({ onStatusChange }: RealtimeVoiceControlProps) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [state, setState] = useState<RealtimeState>("idle");
  const [statusText, setStatusText] = useState("Live Henry IV voice is ready. Start a session, then speak naturally.");
  const [lastSignal, setLastSignal] = useState("No live session yet.");
  const [sessionEvents, setSessionEvents] = useState<string[]>([]);

  const isLive = state === "live" || state === "connecting";

  async function startSession() {
    if (isLive) {
      stopSession("Live Henry IV voice stopped.");
      return;
    }

    setState("connecting");
    setStatusText("Requesting microphone for live Henry IV voice...");
    setLastSignal("Preparing WebRTC voice channel.");
    onStatusChange?.("listening");

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = localStream;

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      peerConnection.onconnectionstatechange = () => {
        const connectionState = peerConnection.connectionState;
        setLastSignal(`WebRTC state: ${connectionState}`);

        if (connectionState === "connected") {
          setState("live");
          setStatusText("Henry IV is listening live. Pause when you finish; he will answer without interrupting.");
          onStatusChange?.("listening");
        }

        if (connectionState === "failed" || connectionState === "disconnected") {
          setState("error");
          setStatusText("Live voice connection dropped. Stop and start the session again.");
          onStatusChange?.("idle");
        }
      };

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (remoteAudioRef.current && remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
          void remoteAudioRef.current.play().catch(() => {
            setLastSignal("Browser blocked audio playback. Click the page once, then restart voice.");
          });
        }
      };

      localStream.getAudioTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;
      dataChannel.onopen = () => {
        appendEvent("Realtime data channel opened.");
      };
      dataChannel.onmessage = (event) => {
        const realtimeSummary = summarizeRealtimeEvent(event.data);
        appendEvent(realtimeSummary.message);

        if (realtimeSummary.feedEntry) {
          void persistRealtimeFeedEntry(realtimeSummary.feedEntry);
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (!offer.sdp) {
        throw new Error("Browser did not create a WebRTC SDP offer.");
      }

      const response = await fetch("/api/realtime/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string; detail?: string } | null;
        const errorMessage = errorBody?.error || "OpenAI Realtime session failed.";
        setState(response.status === 503 ? "blocked" : "error");
        setStatusText(errorMessage);
        setLastSignal(errorBody?.detail ? trimDetail(errorBody.detail) : "No realtime answer SDP received.");
        onStatusChange?.("idle");
        cleanupConnection();
        return;
      }

      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });
      setStatusText("Henry IV live voice is connecting. Speak after the status turns live.");
      appendEvent("Realtime answer received.");
    } catch (error) {
      setState("error");
      setStatusText(error instanceof Error ? error.message : "Live voice failed before connecting.");
      setLastSignal("No external action executed.");
      onStatusChange?.("idle");
      cleanupConnection();
    }
  }

  function stopSession(message = "Live Henry IV voice stopped.") {
    cleanupConnection();
    setState("idle");
    setStatusText(message);
    setLastSignal("Session closed locally.");
    onStatusChange?.("idle");
  }

  function cleanupConnection() {
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }
  }

  function appendEvent(message: string) {
    setSessionEvents((current) => [message, ...current].slice(0, 4));
    setLastSignal(message);
  }

  return (
    <section className="glass-panel rounded-lg border-yellow-300/25 p-4">
      <audio ref={remoteAudioRef} autoPlay />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-yellow-200" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-100">Live Henry IV</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{statusText}</p>
        </div>
        <button
          type="button"
          onClick={startSession}
          aria-label={isLive ? "Stop live Henry IV voice" : "Start live Henry IV voice"}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/15 text-yellow-100 shadow-[0_0_28px_rgba(250,204,21,0.28)] transition hover:bg-yellow-300/24"
        >
          {isLive ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.13em] text-zinc-300">
        <StatusChip icon={<Headphones className="size-3" />} label={stateLabel(state)} />
        <StatusChip icon={<Volume2 className="size-3" />} label="Realtime voice" />
        <StatusChip icon={<ShieldCheck className="size-3" />} label="Server key only" />
      </div>

      <div className="mt-3 rounded-lg border border-yellow-300/15 bg-black/55 p-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-yellow-200">Signal</p>
        <p className="mt-1 text-xs text-zinc-300">{lastSignal}</p>
      </div>

      {sessionEvents.length ? (
        <div className="mt-3 grid gap-1 text-xs text-zinc-400">
          {sessionEvents.map((event) => (
            <p key={event} className="truncate rounded-md border border-zinc-700/45 bg-black/45 px-2 py-1">
              {event}
            </p>
          ))}
        </div>
      ) : null}

      {state === "blocked" ? (
        <p className="mt-3 text-xs text-amber-200">
          Waiting only on `OPENAI_API_KEY` in `.env.local`. Do not paste the key into chat.
        </p>
      ) : null}
    </section>
  );
}

function StatusChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center justify-center gap-1 rounded-lg border border-zinc-600/40 bg-black/45 px-2 py-2">
      {icon}
      {label}
    </span>
  );
}

function stateLabel(state: RealtimeState) {
  const labels: Record<RealtimeState, string> = {
    idle: "Idle",
    connecting: "Connecting",
    live: "Live",
    blocked: "Key needed",
    error: "Error",
  };

  return labels[state];
}

function summarizeRealtimeEvent(rawData: string): {
  message: string;
  feedEntry?: {
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, unknown>;
  };
} {
  try {
    const event = JSON.parse(rawData) as RealtimeEvent;
    const type = event.type || "realtime.event";

    if (event.error?.message) {
      return {
        message: `Realtime error: ${event.error.message}`,
        feedEntry: { role: "system", content: event.error.message, metadata: { type } },
      };
    }

    const transcript = extractTranscript(event);

    if (transcript) {
      const isUser = type.includes("input_audio") || event.item?.role === "user";
      const role = isUser ? "user" : "assistant";

      return {
        message: `${role === "user" ? "You" : "Henry IV"}: ${transcript}`,
        feedEntry: { role, content: transcript, metadata: { type } },
      };
    }

    if (event.text) {
      return {
        message: `Henry IV: ${event.text}`,
        feedEntry: { role: "assistant", content: event.text, metadata: { type } },
      };
    }

    return { message: event.type ? `Realtime event: ${event.type}` : "Realtime event received." };
  } catch {
    return { message: "Realtime event received." };
  }
}

function extractTranscript(event: RealtimeEvent) {
  return (
    event.transcript ||
    event.text ||
    event.item?.content?.map((content) => content.transcript || content.text).filter(Boolean).join(" ").trim() ||
    event.response?.output
      ?.flatMap((output) => output.content ?? [])
      .map((content) => content.transcript || content.text)
      .filter(Boolean)
      .join(" ")
      .trim() ||
    ""
  );
}

async function persistRealtimeFeedEntry(entry: { role: "user" | "assistant" | "system"; content: string; metadata?: Record<string, unknown> }) {
  await fetch("/api/codex/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: entry.role,
      content: entry.content,
      source: "voice",
      channel: "realtime_voice",
      metadata: entry.metadata,
    }),
  }).catch(() => undefined);
}

function trimDetail(detail: string) {
  return detail.length > 180 ? `${detail.slice(0, 180)}...` : detail;
}
