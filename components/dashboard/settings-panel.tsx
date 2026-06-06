"use client";

import { Settings } from "lucide-react";

export type DashboardTheme = "neon" | "midnight" | "contrast";

type SettingsPanelProps = {
  assistantName: string;
  voiceMode: boolean;
  theme: DashboardTheme;
  onAssistantNameChange: (value: string) => void;
  onVoiceModeChange: (value: boolean) => void;
  onThemeChange: (value: DashboardTheme) => void;
};

export function SettingsPanel({
  assistantName,
  voiceMode,
  theme,
  onAssistantNameChange,
  onVoiceModeChange,
  onThemeChange,
}: SettingsPanelProps) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-100">
        <Settings className="size-4" />
        Settings
      </h2>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm text-zinc-300">
          Assistant name
          <input
            value={assistantName}
            onChange={(event) => onAssistantNameChange(event.target.value)}
            className="rounded-lg border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
          Voice mode
          <input type="checkbox" checked={voiceMode} onChange={(event) => onVoiceModeChange(event.target.checked)} />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          Dashboard theme
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as DashboardTheme)}
            className="rounded-lg border border-yellow-300/20 bg-black/60 px-3 py-2 text-white outline-none"
          >
            <option value="neon">Neon</option>
            <option value="midnight">Midnight</option>
            <option value="contrast">TV contrast</option>
          </select>
        </label>
      </div>
    </section>
  );
}
