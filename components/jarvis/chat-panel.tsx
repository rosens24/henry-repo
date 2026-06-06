import type { JarvisMessage } from "@/lib/ai/types";
import { CommandMessage } from "@/components/jarvis/command-message";

type ChatPanelProps = {
  messages: JarvisMessage[];
  isLoading: boolean;
};

export function ChatPanel({ messages, isLoading }: ChatPanelProps) {
  return (
    <section className="max-h-[300px] overflow-hidden rounded-md border border-yellow-300/15 bg-black/55 p-2.5 lg:max-h-[360px]">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="hud-title">Command Log</h2>
        <span className="rounded-md border border-yellow-300/15 bg-yellow-300/8 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-yellow-100">
          {messages.length} entries
        </span>
      </div>
      <div className="flex max-h-[230px] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[295px]">
        {messages.length === 0 ? <p className="text-sm text-zinc-400">No command history yet.</p> : null}
        {messages.map((message) => (
          <CommandMessage key={message.id} message={message} />
        ))}
        {isLoading ? (
          <div className="data-rail inline-block w-fit rounded-md border border-yellow-300/20 bg-yellow-400/10 px-2.5 py-1.5 text-xs text-yellow-50">
            Henry IV is thinking...
          </div>
        ) : null}
      </div>
    </section>
  );
}
