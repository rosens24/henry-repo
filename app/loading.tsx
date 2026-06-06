export default function Loading() {
  return (
    <main className="jarvis-grid flex min-h-screen items-center justify-center bg-black p-6 text-zinc-100">
      <section className="glass-panel rounded-lg p-6 text-center">
        <div className="mx-auto mb-4 size-12 animate-pulse rounded-full border border-yellow-200 bg-yellow-300/20 shadow-[0_0_32px_rgba(250,204,21,0.3)]" />
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">Henry IV is online</p>
      </section>
    </main>
  );
}
