// Global Vitest setup for DOM matchers, automatic React cleanup, and matchMedia stubbing.

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// Provide a deterministic matchMedia implementation for JSDOM environments
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

import { vi } from "vitest";
import { fakeInvokeCommand } from "./fake-tauri-fs";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => fakeInvokeCommand(cmd),
}));