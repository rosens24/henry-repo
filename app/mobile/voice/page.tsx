"use client";

import { useEffect, useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { RealtimeVoiceControl } from "@/components/voice/realtime-voice-control";

export default function MobileVoicePage() {
  const [status, setStatus] = useState("Ready for: Henry IV push to XENOMORPH");
  const [response, setResponse] = useState("Tap the mic and speak. Real-world actions stay approval-gated.");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setSpeechSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  async function runVoiceCommand(command: string) {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) {
      setStatus("Type a command or tap the mic first.");
      return;
    }

    setStatus(`Heard: ${trimmedCommand}`);
    const apiResponse = await fetch("/api/jarvis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: trimmedCommand, source: "voice", actorRole: "owner", readOnlyMode: true }),
    });

    if (!apiResponse.ok) {
      setResponse("Henry IV API rejected the command. Check AI Provider status. No action executed.");
      return;
    }

    const result = (await apiResponse.json()) as { message: { content: string } };
    setResponse(result.message.content);
    speak(result.message.content);
  }

  function startListening() {
    setIsListening(true);
    setStatus("Listening...");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      setStatus("Speech recognition is blocked in this browser. Type the command below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() || "";
      setIsListening(false);

      if (!transcript) {
        setStatus("I did not catch that. Try again or type the command below.");
        return;
      }

      void runVoiceCommand(transcript);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setStatus(`Voice error: ${event.error}. Type the command below.`);
    };
    recognition.start();
  }

  return (
    <MobileShell title="Voice">
      <RealtimeVoiceControl />
      <section className="glass-panel rounded-lg p-6 text-center">
        <button
          type="button"
          onClick={startListening}
          className="mx-auto flex size-24 items-center justify-center rounded-full border border-yellow-300/35 bg-yellow-300/15 text-yellow-100 shadow-[0_0_46px_rgba(250,204,21,0.34)]"
          aria-label="Start mobile voice command"
        >
          <Mic className="size-10" />
        </button>
        <p className="mt-5 text-sm text-zinc-300">{isListening ? "Listening for Henry IV..." : status}</p>
        <p className="mt-2 text-xs text-zinc-500">{speechSupported ? "Browser speech recognition ready." : "Browser speech recognition may be blocked; fallback command is available."}</p>
        <div className="mt-4 flex gap-2">
          <input
            value={typedCommand}
            onChange={(event) => setTypedCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void runVoiceCommand(typedCommand);
                setTypedCommand("");
              }
            }}
            placeholder="Type Henry IV command..."
            className="min-w-0 flex-1 rounded-lg border border-yellow-300/20 bg-black/60 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={() => {
              void runVoiceCommand(typedCommand);
              setTypedCommand("");
            }}
            className="rounded-lg border border-yellow-300/25 bg-yellow-300/10 px-3 py-2 text-sm font-semibold text-yellow-50"
          >
            Send
          </button>
        </div>
        <div className="mt-4 rounded-lg border border-yellow-300/20 bg-yellow-300/10 p-4 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-100"><Volume2 className="size-4" />Henry IV Response</p>
          <p className="mt-2 text-sm text-zinc-300">{response}</p>
        </div>
        <p className="mt-3 text-xs text-zinc-500">Mobile voice uses the real Henry IV API. No real code, messages, payments, or booking changes execute without approval.</p>
      </section>
    </MobileShell>
  );
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text.slice(0, 220));
  utterance.rate = 0.95;
  utterance.pitch = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
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
