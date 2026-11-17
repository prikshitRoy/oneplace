// Pure functions and constants for validating and resolving user theme settings.

import type { ResolvedTheme, ThemeMode, ThemeOption } from "./types";

/** LocalStorage key used to persist the user's selected ThemeMode. */
export const THEME_STORAGE_KEY = "one-place:theme-mode";

/** Default theme mode used when no preference has been saved yet. */
export const DEFAULT_THEME_MODE: ThemeMode = "system";

/** Selectable theme options displayed inside the Settings modal. */
export const AVAILABLE_THEME_OPTIONS: readonly ThemeOption[] = [
  {
    mode: "light",
    label: "Light",
    description: "Clean bright surfaces for daytime use.",
  },
  {
    mode: "dark",
    label: "Dark",
    description: "Low-glare dark surfaces for focused work.",
  },
  {
    mode: "system",
    label: "System",
    description: "Automatically match your operating system theme.",
  },
];

/** Checks whether an arbitrary string is a valid ThemeMode. */
export function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** Parses a raw storage value into a valid ThemeMode, falling back to DEFAULT_THEME_MODE. */
export function parseStoredThemeMode(rawValue: string | null | undefined): ThemeMode {
  if (isValidThemeMode(rawValue)) {
    return rawValue;
  }
  return DEFAULT_THEME_MODE;
}

/** Resolves the active visual theme ("light" or "dark") from the selected mode and OS preference. */
export function resolveEffectiveTheme(
  mode: ThemeMode,
  isSystemDark: boolean
): ResolvedTheme {
  if (mode === "system") {
    return isSystemDark ? "dark" : "light";
  }
  return mode;
}
