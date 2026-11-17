// Browser-side Tauri v2 IPC mock injected into Playwright pages before app scripts run.

import type { Page } from "@playwright/test";

/** Injects an in-memory Tauri v2 IPC bridge into the Playwright browser context. */
export async function installTauriBrowserMock(
  page: Page,
  osType: "windows" | "linux" | "android" = "windows"
): Promise<void> {
  await page.addInitScript((currentOs) => {
    interface MockEntry {
      parent: string;
      name: string;
      isDirectory: boolean;
      size: number;
      mtime: number;
    }

    const entries: MockEntry[] = [
      {
        parent: ".",
        name: "Workspaces",
        isDirectory: true,
        size: 0,
        mtime: 1763380800000,
      },
      {
        parent: ".",
        name: "notes.md",
        isDirectory: false,
        size: 1024,
        mtime: 1763380800000,
      },
      {
        parent: "Workspaces",
        name: "architecture.pdf",
        isDirectory: false,
        size: 2048,
        mtime: 1763380800000,
      },
    ];

    /** Maps Android shared storage root prefixes to "." or relative subpaths. */
    function normalizeMockPath(rawPath: string): string {
      const cleaned = rawPath.replace(/\\/g, "/").replace(/\/+$/, "");
      const androidRootMatch = cleaned.match(
        /^\/storage\/emulated\/0\/(?:Documents|Download|Pictures|Movies|Music)(?:\/(.*))?$/
      );
      if (androidRootMatch) {
        return androidRootMatch[1] ? androidRootMatch[1] : ".";
      }
      return cleaned || ".";
    }

    (window as unknown as Record<string, unknown>).__TAURI_OS_PLUGIN_INTERNALS__ = {
      arch: "x86_64",
      eol: "\n",
      exe_extension: "",
      family: "unix",
      os_type: currentOs,
      platform: currentOs,
      version: "1.0.0",
    };

    (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
      transformCallback: () => 1,
      invoke: async (cmd: string, args: Record<string, unknown> = {}) => {
        if (cmd === "plugin:fs|read_dir") {
          const targetPath = normalizeMockPath(String(args.path ?? "."));
          return entries
            .filter((item) => item.parent === targetPath)
            .map((item) => ({
              name: item.name,
              isDirectory: item.isDirectory,
              isFile: !item.isDirectory,
              isSymlink: false,
            }));
        }

        if (cmd === "plugin:fs|stat") {
          const normalized = normalizeMockPath(String(args.path ?? ""));
          const parts = normalized.split("/");
          const name = parts[parts.length - 1] ?? "";
          const found = entries.find((item) => item.name === name);
          return {
            size: found?.size ?? 0,
            mtime: found?.mtime ?? 1763380800000,
            isDirectory: found?.isDirectory ?? false,
            isFile: !(found?.isDirectory ?? false),
            isSymlink: false,
          };
        }

        if (cmd === "plugin:fs|mkdir") {
          const normalized = normalizeMockPath(String(args.path ?? ""));
          if (normalized === ".") {
            return null;
          }
          const parts = normalized.split("/");
          const name = parts[parts.length - 1] ?? normalized;
          const parent = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";
          const alreadyExists = entries.some(
            (item) => item.parent === parent && item.name === name
          );
          if (!alreadyExists) {
            entries.push({
              parent,
              name,
              isDirectory: true,
              size: 0,
              mtime: 1763380800000,
            });
          }
          return null;
        }

        return null;
      },
    };
  }, osType);
}
