"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-zinc-100">
      <section className="glass-panel max-w-lg rounded-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-300">Henry IV fault</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Command center recovered safely.</h1>
        <p className="mt-3 text-sm text-zinc-300">{error.message || "An unexpected dashboard error occurred."}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg border border-yellow-300/30 bg-yellow-300/15 px-4 py-2 text-sm font-semibold text-yellow-50"
        >
          Restart dashboard
        </button>
      </section>
    </main>
  );
}
