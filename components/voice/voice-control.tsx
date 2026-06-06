"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard, Mic, MicOff, Radio, Volume2 } from "lucide-react";
import type { AiStatus } from "@/lib/ai/types";

type VoiceControlProps = {
  status: AiStatus;
  onStatusChange: (status: AiStatus) => void;
  onTranscript: (command: string) => void;
};

export function VoiceControl({ status, onStatusChange, onTranscript }: VoiceControlProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [lastHeard, setLastHeard] = useState("Nothing heard yet.");
  const [voiceState, setVoiceState] = useState("Ready. Click mic, allow microphone, then speak. Henry IV will not interrupt you.");
  const [manualCommand, setManualCommand] = useState("");
  const [sttHealth, setSttHealth] = useState<"checking" | "ready" | "blocked" | "degraded">("checking");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [supportChecked, setSupportChecked] = useState(false);
  const isListening = status === "listening";

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const hasSpeechRecognition = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
      setSpeechSupported(hasSpeechRecognition);
      setSttHealth(hasSpeechRecognition ? "ready" : "blocked");
      setTtsSupported("speechSynthesis" in window);
      setSupportChecked(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  async function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      onStatusChange("idle");
      setVoiceState("Stopped listening.");
      return;
    }

    onStatusChange("listening");
    setVoiceState("Requesting microphone...");

    const browserSpeechSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!browserSpeechSupported) {
      setVoiceState("Speech recognition is not supported in this browser. Use Chrome or Edge on localhost.");
      onStatusChange("idle");
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      setVoiceState("Microphone permission was blocked. Allow mic access in the browser address bar.");
      onStatusChange("idle");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState("Speech recognition became unavailable. Use Chrome or Edge on localhost.");
      onStatusChange("idle");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) {
        setVoiceState("I did not catch that. Try again closer to the mic.");
        onStatusChange("idle");
        return;
      }

      setLastHeard(transcript);
      setVoiceState("Command heard. Henry IV is answering...");
      onTranscript(transcript);
    };
    recognition.onerror = (event) => {
      onStatusChange("idle");
      setSttHealth(event.error === "network" ? "degraded" : "blocked");
      setVoiceState(
        event.error === "network"
          ? "Browser STT network failed. Use the typed voice fallback below; Henry IV can still answer back."
          : `Voice error: ${event.error}. Check mic permission and browser support.`,
      );
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      onStatusChange("idle");
    };

    try {
      window.speechSynthesis?.cancel();
      setVoiceState("Listening now. Speak freely. Henry IV will wait until you finish.");
      recognition.start();
    } catch {
      setVoiceState("Could not start microphone listener. Refresh the page and try once.");
      onStatusChange("idle");
    }
  }

  function testVoice() {
    const message = "Henry IV voice output is online, kind sir.";
    setVoiceState(message);
    unlockSpeech(message);
  }

  async function checkMicPermission() {
    setVoiceState("Checking microphone permission...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setVoiceState("Microphone permission is working. Click the mic and speak.");
    } catch {
      setVoiceState("Microphone is blocked. Open browser site settings for localhost and allow microphone.");
    }
  }

  function playSoundTest() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        setVoiceState("Web Audio is not supported in this browser.");
        return;
      }

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 740;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.22);
      setVoiceState("Sound test played. If you heard nothing, check browser tab/system volume.");
    } catch {
      setVoiceState("Sound test failed. Browser audio output is blocked.");
    }
  }

  async function testJarvisApiReply() {
    setVoiceState("Testing Henry IV API reply...");

    try {
      const response = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "Henry IV summarize today",
          source: "typed",
          actorRole: "owner",
          readOnlyMode: true,
        }),
      });

      if (!response.ok) {
        setVoiceState("Henry IV API test failed. Check the dev server console.");
        return;
      }

      const result = (await response.json()) as { message: { content: string } };
      setVoiceState(result.message.content);
      unlockSpeech(result.message.content);
    } catch {
      setVoiceState("Henry IV API test failed before a response came back.");
    }
  }

  function runFallbackCommand() {
    const command = "Henry IV push to XENOMORPH";
    setLastHeard(command);
    setVoiceState("Fallback command sent.");
    onTranscript(command);
  }

  function submitManualVoiceCommand() {
    const command = manualCommand.trim();

    if (!command) return;

    setLastHeard(command);
    setVoiceState("Typed voice fallback sent. Henry IV is answering...");
    setManualCommand("");
    onTranscript(command);
  }

  function unlockSpeech(text: string) {
    if (!ttsSupported) return;

    const utterance = new SpeechSynthesisUtterance(text);
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

  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Voice</h2>
          <p className="mt-1 text-xs text-slate-400">{voiceState}</p>
        </div>
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          className="inline-flex size-12 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/14 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300/22"
        >
          {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span className="rounded-lg border border-slate-600/40 bg-slate-950/45 px-2 py-2">
          {supportChecked ? sttLabel(sttHealth, speechSupported) : "STT check"}
        </span>
        <span className="rounded-lg border border-slate-600/40 bg-slate-950/45 px-2 py-2">{supportChecked ? (ttsSupported ? "TTS ready" : "TTS blocked") : "TTS check"}</span>
        <span className="rounded-lg border border-slate-600/40 bg-slate-950/45 px-2 py-2">Wake: Henry IV</span>
      </div>
      <p className="mt-3 text-xs text-slate-300">Heard: {lastHeard}</p>
      <div className="mt-3 flex gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-cyan-300/20 bg-slate-950/55 px-3 py-2">
          <Keyboard className="size-4 shrink-0 text-cyan-200" />
          <input
            value={manualCommand}
            onChange={(event) => setManualCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitManualVoiceCommand();
            }}
            placeholder="Typed voice fallback..."
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </label>
        <button
          type="button"
          onClick={submitManualVoiceCommand}
          className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50"
        >
          Send
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={testVoice}
          className="flex items-center justify-center gap-2 rounded-lg border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-2 text-xs font-semibold text-fuchsia-50"
        >
          <Volume2 className="size-4" />
          Test voice reply
        </button>
        <button
          type="button"
          onClick={runFallbackCommand}
          className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50"
        >
          Send XENOMORPH command
        </button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={checkMicPermission}
          className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-50"
        >
          Check mic
        </button>
        <button
          type="button"
          onClick={playSoundTest}
          className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-50"
        >
          Sound beep
        </button>
        <button
          type="button"
          onClick={testJarvisApiReply}
          className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50"
        >
          <Radio className="size-3" />
          API reply
        </button>
      </div>
    </section>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  }
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventShape) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventShape = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type AudioContextConstructor = new () => AudioContext;

function sttLabel(health: "checking" | "ready" | "blocked" | "degraded", supported: boolean) {
  if (!supported || health === "blocked") return "STT blocked";
  if (health === "degraded") return "STT degraded";
  if (health === "ready") return "STT ready";

  return "STT check";
}
