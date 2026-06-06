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
            ? "inline-block max-w-[92%] rounded-md border border-zinc-300/25 bg-zinc-500/12 px-2.5 py-1.5 text-xs text-zinc-50"
            : "inline-block max-w-[92%] rounded-md border border-yellow-300/25 bg-yellow-400/10 px-2.5 py-1.5 text-xs text-yellow-50"
        }
      >
        <p>{message.content}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">{message.source}</p>
      </div>
    </article>
  );
}
