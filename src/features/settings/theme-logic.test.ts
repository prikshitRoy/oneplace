// Unit tests for pure theme parsing and effective theme resolution logic.

import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_MODE,
  parseStoredThemeMode,
  resolveEffectiveTheme,
} from "./theme-logic";

describe("parseStoredThemeMode", () => {
  it("returns the stored mode when valid and falls back to system for invalid inputs", () => {
    // Arrange & Act
    const validLight = parseStoredThemeMode("light");
    const validDark = parseStoredThemeMode("dark");
    const invalidValue = parseStoredThemeMode("neon-purple");
    const emptyValue = parseStoredThemeMode(null);

    // Assert
    expect(validLight).toBe("light");
    expect(validDark).toBe("dark");
    expect(invalidValue).toBe(DEFAULT_THEME_MODE);
    expect(emptyValue).toBe(DEFAULT_THEME_MODE);
  });
});

describe("resolveEffectiveTheme", () => {
  it("respects explicit light or dark mode regardless of OS setting", () => {
    // Arrange & Act
    const explicitLight = resolveEffectiveTheme("light", true);
    const explicitDark = resolveEffectiveTheme("dark", false);

    // Assert
    expect(explicitLight).toBe("light");
    expect(explicitDark).toBe("dark");
  });

  it("follows the OS dark preference when mode is set to system", () => {
    // Arrange & Act
    const systemWhenOsDark = resolveEffectiveTheme("system", true);
    const systemWhenOsLight = resolveEffectiveTheme("system", false);

    // Assert
    expect(systemWhenOsDark).toBe("dark");
    expect(systemWhenOsLight).toBe("light");
  });
});
