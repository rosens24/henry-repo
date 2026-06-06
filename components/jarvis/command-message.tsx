import type { JarvisMessage } from "@/lib/ai/types";

type CommandMessageProps = {
  message: JarvisMessage;
};

export function CommandMessage({ message }: CommandMessageProps) {
  const isUser = message.role === "user";

  return (
    <article className={isUser ? "text-right" : "text-left"}>
      <div
        className={
          isUser
            ? "inline-block max-w-[92%] rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/12 px-3 py-2 text-sm text-fuchsia-50"
            : "inline-block max-w-[92%] rounded-lg border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-50"
        }
      >
        <p>{message.content}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{message.source}</p>
      </div>
    </article>
  );
}
