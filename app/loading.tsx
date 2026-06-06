export default function Loading() {
  return (
    <main className="jarvis-grid flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="glass-panel rounded-lg p-6 text-center">
        <div className="mx-auto mb-4 size-12 animate-pulse rounded-full border border-cyan-200 bg-cyan-300/20 shadow-[0_0_32px_rgba(34,211,238,0.3)]" />
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">Henry IV is online</p>
      </section>
    </main>
  );
}
