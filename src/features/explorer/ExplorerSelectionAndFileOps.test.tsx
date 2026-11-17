// Layer 2 UI integration tests for Multi-Select, Select All/Clear, New File, Cut/Move, and System Opener.

import { BaseDirectory } from "@tauri-apps/api/path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fakeCopyFile,
  fakeGetOsType,
  fakeMkdir,
  fakeOpenDialog,
  fakeOpenPath,
  fakeReadDir,
  fakeRemove,
  fakeRename,
  fakeStat,
  fakeWriteTextFile,
  getOpenedSystemPaths,
  resetFakeFileSystem,
  type FakeFsNode,
} from "@/test-support/fake-tauri-fs";
import { ExplorerShell } from "./ExplorerShell";

// Mock @tauri-apps/api/path so resolveNativeSystemPath resolves deterministically in JSDOM
vi.mock("@tauri-apps/api/path", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tauri-apps/api/path")>();
  return {
    ...actual,
    documentDir: async () => "C:/Users/Test/Documents",
    join: async (...parts: string[]) => parts.join("/"),
  };
});

vi.mock("@tauri-apps/plugin-fs", () => ({
  readDir: (...args: Parameters<typeof fakeReadDir>) => fakeReadDir(...args),
  stat: (...args: Parameters<typeof fakeStat>) => fakeStat(...args),
  mkdir: (...args: Parameters<typeof fakeMkdir>) => fakeMkdir(...args),
  writeTextFile: (...args: Parameters<typeof fakeWriteTextFile>) =>
    fakeWriteTextFile(...args),
  rename: (...args: Parameters<typeof fakeRename>) => fakeRename(...args),
  remove: (...args: Parameters<typeof fakeRemove>) => fakeRemove(...args),
  copyFile: (...args: Parameters<typeof fakeCopyFile>) => fakeCopyFile(...args),
}));

vi.mock("@tauri-apps/plugin-os", () => ({
  type: () => fakeGetOsType(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: () => fakeOpenDialog(),
}));

vi.mock("@tauri-apps/plugin-opener", () => ({
  openPath: (path: string) => fakeOpenPath(path),
}));

const SEED_NODES: readonly FakeFsNode[] = [
  {
    baseDir: BaseDirectory.Document,
    parentPath: "",
    name: "Projects",
    isDirectory: true,
    sizeBytes: 0,
    mtimeMs: Date.UTC(2026, 10, 17, 10, 0, 0),
  },
  {
    baseDir: BaseDirectory.Document,
    parentPath: "",
    name: "roadmap.md",
    isDirectory: false,
    sizeBytes: 2048,
    mtimeMs: Date.UTC(2026, 10, 17, 11, 0, 0),
  },
];

describe("ExplorerShell UI integration — Selection Helpers, Cut/Move & System Opener", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeFileSystem(SEED_NODES, "windows");
  });

  it("supports Multi-Select toggle mode, Select All, and Clear selection buttons", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: enable Multi-Select mode and click both cards directly
    await user.click(screen.getByRole("button", { name: "Multi-Select" }));
    expect(
      screen.getByRole("button", { name: "Multi-Select: ON" })
    ).toBeInTheDocument();

    await user.click(screen.getByText("Projects"));
    await user.click(screen.getByText("roadmap.md"));

    // Assert: both items are selected simultaneously
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    // Act: click Clear, then click Select All
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Select All" }));
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("creates a new text file when a valid filename is confirmed in New File modal", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act
    await user.click(screen.getByRole("button", { name: /New File/i }));
    const nameInput = screen.getByPlaceholderText("Enter name...");
    await user.clear(nameInput);
    await user.type(nameInput, "todo.txt");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert
    expect(await screen.findByText("todo.txt")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("moves a file into a subfolder using Cut and Paste Here and clears the clipboard", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: select roadmap.md, click Cut, open Projects folder, and click Paste Here
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));
    await user.click(screen.getByRole("button", { name: /Cut/i }));
    await user.click(screen.getAllByRole("button", { name: "Open" })[0]);

    const pasteButton = await screen.findByRole("button", {
      name: /Paste Here \(1 cut\)/i,
    });
    await user.click(pasteButton);

    // Assert: file moved into Projects, clipboard cleared, and removed from root Documents
    expect(await screen.findByText("roadmap.md")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Paste Here/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Navigate back" }));
    await screen.findByText("Projects");
    expect(screen.queryByText("roadmap.md")).not.toBeInTheDocument();
  });

  it("opens a file with the system default application when Open is clicked on a file", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: click the second Open button (index 0 is Projects folder, index 1 is roadmap.md file)
    const openButtons = screen.getAllByRole("button", { name: "Open" });
    await user.click(openButtons[1]);

    // Assert
    await waitFor(() => {
      expect(getOpenedSystemPaths()).toEqual([
        "C:/Users/Test/Documents/roadmap.md",
      ]);
    });
  });
});
