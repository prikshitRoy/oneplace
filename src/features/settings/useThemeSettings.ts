// Side-effect hook that syncs ThemeMode with localStorage, OS media queries, and the HTML root class.

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME_MODE,
  parseStoredThemeMode,
  resolveEffectiveTheme,
  THEME_STORAGE_KEY,
} from "./theme-logic";
import type { ResolvedTheme, ThemeMode } from "./types";

/** Media query string used to detect whether the OS prefers a dark color scheme. */
const SYSTEM_DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** Applies the resolved theme class ("dark") and data-theme attribute to document.documentElement. */
function applyThemeToDocument(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }
  const rootElement = document.documentElement;
  rootElement.classList.toggle("dark", resolvedTheme === "dark");
  rootElement.setAttribute("data-theme", resolvedTheme);
}

/** Manages user theme state and synchronizes changes with localStorage and the DOM. */
export function useThemeSettings() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [isSystemDark, setIsSystemDark] = useState<boolean>(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    setThemeModeState(parseStoredThemeMode(stored));

    const mediaQuery = window.matchMedia(SYSTEM_DARK_MEDIA_QUERY);
    setIsSystemDark(mediaQuery.matches);

    function handleSystemChange(event: MediaQueryListEvent): void {
      setIsSystemDark(event.matches);
    }

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const resolvedTheme = resolveEffectiveTheme(themeMode, isSystemDark);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  /** Updates the active theme mode and persists it to localStorage. */
  function setThemeMode(nextMode: ThemeMode): void {
    setThemeModeState(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    }
  }

  return {
    themeMode,
    resolvedTheme,
    setThemeMode,
  };
}
