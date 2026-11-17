// Accessible Settings dialog allowing the user to switch between Light, Dark, and System themes.

import { AVAILABLE_THEME_OPTIONS } from "./theme-logic";
import type { ResolvedTheme, ThemeMode } from "./types";

export interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly themeMode: ThemeMode;
  readonly resolvedTheme: ResolvedTheme;
  readonly onSelectThemeMode: (mode: ThemeMode) => void;
  readonly onClose: () => void;
}

/** Renders the application settings modal with interactive theme selection cards. */
export function SettingsModal({
  isOpen,
  themeMode,
  resolvedTheme,
  onSelectThemeMode,
  onClose,
}: SettingsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-panel p-5 text-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 id="settings-modal-title" className="text-base font-semibold">
              Settings
            </h2>
            <p className="text-xs text-muted">
              Customize how One Place looks across your devices
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-elevated px-2.5 py-1 text-xs font-medium hover:border-sky-500"
          >
            Done
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Appearance / Theme
            </span>
            <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-500">
              Active: {resolvedTheme === "dark" ? "Dark" : "Light"}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {AVAILABLE_THEME_OPTIONS.map((option) => {
              const isSelected = themeMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => onSelectThemeMode(option.mode)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500"
                      : "border-border bg-elevated/60 hover:border-sky-500/50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-semibold">{option.label}</span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
