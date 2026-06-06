"use client";

import { forwardRef, FormEvent, useState } from "react";
import { SendHorizontal, Terminal } from "lucide-react";

type CommandInputProps = {
  history: string[];
  isLoading: boolean;
  onSubmit: (command: string) => void;
};

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
  { history, isLoading, onSubmit },
  ref,
) {
  const [command, setCommand] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(command);
    setCommand("");
  }

  return (
    <section className="glass-panel rounded-lg p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-lg border border-cyan-300/20 bg-slate-950/60 px-4 py-3">
          <Terminal className="size-5 shrink-0 text-cyan-200" />
          <input
            ref={ref}
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Ask Henry IV to summarize today, check bookings, or prep a cleaner update..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/15 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/24"
        >
          <SendHorizontal className="size-4" />
          {isLoading ? "Running" : "Execute"}
        </button>
      </form>
      {history.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {history.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCommand(item)}
              className="rounded-lg border border-slate-500/30 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-cyan-100"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
});
