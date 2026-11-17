// Data contracts for user theme preferences and application settings.

/** User-selectable theme preference modes. */
export type ThemeMode = "light" | "dark" | "system";

/** Concrete visual theme applied to the document root element. */
export type ResolvedTheme = "light" | "dark";

/** Metadata describing a selectable theme option in the Settings UI. */
export interface ThemeOption {
  readonly mode: ThemeMode;
  readonly label: string;
  readonly description: string;
}
