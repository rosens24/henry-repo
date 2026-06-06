import Link from "next/link";
import type { ReactNode } from "react";

type MobileShellProps = {
  title: string;
  children: ReactNode;
};

const navItems = [
  { href: "/mobile", label: "Command" },
  { href: "/mobile/briefings", label: "Briefings" },
  { href: "/mobile/approvals", label: "Approvals" },
  { href: "/mobile/tasks", label: "Tasks" },
  { href: "/mobile/agents", label: "Agents" },
  { href: "/mobile/voice", label: "Voice" },
];

export function MobileShell({ title, children }: MobileShellProps) {
  return (
    <main className="jarvis-grid min-h-screen bg-slate-950 p-4 text-slate-100">
      <header className="glass-panel sticky top-3 z-10 rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">Cleanz mobile command</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-50">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <section className="mt-4 grid gap-4">{children}</section>
    </main>
  );
}
