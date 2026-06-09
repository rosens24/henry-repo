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
    <section className="glass-panel rounded-md p-2.5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-md border border-yellow-300/20 bg-black/60 px-3 py-2">
          <Terminal className="size-4 shrink-0 text-yellow-200" />
          <input
            ref={ref}
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Ask Henry IV..."
            className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-zinc-500 sm:text-xs"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-300/15 px-4 py-2 text-sm font-semibold text-yellow-50 transition hover:bg-yellow-300/24 sm:min-h-0 sm:text-xs"
        >
          <SendHorizontal className="size-4" />
          {isLoading ? "Running" : "Execute"}
        </button>
      </form>
      {history.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {history.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCommand(item)}
              className="rounded-md border border-zinc-500/30 bg-zinc-950/60 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-yellow-300/40 hover:text-yellow-100"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
});
