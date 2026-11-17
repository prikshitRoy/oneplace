// Layer 2 UI integration tests for file CRUD operations, multi-selection, and theme switching.

import { BaseDirectory } from "@tauri-apps/api/path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY } from "@/features/settings";
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
  resetFakeFileSystem,
  type FakeFsNode,
} from "@/test-support/fake-tauri-fs";
import { ExplorerShell } from "./ExplorerShell";

// Wire Tauri side-effect plugins to the in-memory fake file system
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

describe("ExplorerShell UI integration — CRUD, Selection & Themes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeFileSystem(SEED_NODES, "windows");
  });

  it("creates a new folder when a valid name is submitted in NamePromptModal", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    // Act
    await user.click(screen.getByRole("button", { name: /New Folder/i }));
    const nameInput = screen.getByPlaceholderText("Enter name...");
    await user.type(nameInput, "Invoices");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert
    expect(await screen.findByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("displays an inline validation alert and blocks creation when a reserved name is entered", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    // Act
    await user.click(screen.getByRole("button", { name: /New File/i }));
    const nameInput = screen.getByPlaceholderText("Enter name...");
    await user.clear(nameInput);
    await user.type(nameInput, "CON");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent(
      '"CON" is a reserved system name.'
    );
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("renames a selected file when Rename is clicked and a new name is confirmed", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));
    await user.click(screen.getByRole("button", { name: /Rename/i }));
    const nameInput = screen.getByPlaceholderText("Enter name...");
    await user.clear(nameInput);
    await user.type(nameInput, "summary.md");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert
    expect(await screen.findByText("summary.md")).toBeInTheDocument();
    expect(screen.queryByText("roadmap.md")).not.toBeInTheDocument();
  });

  it("copies a selected file into a subfolder using Copy and Paste Here", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: select roadmap.md, stage Copy, open Projects folder, and click Paste Here
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));
    await user.click(screen.getByRole("button", { name: /Copy/i }));
    const openButtons = screen.getAllByRole("button", { name: "Open" });
    await user.click(openButtons[0]);
    await user.click(await screen.findByRole("button", { name: /Paste Here/i }));

    // Assert: roadmap.md is now present inside the Projects subfolder
    expect(await screen.findByText("roadmap.md")).toBeInTheDocument();
  });

  it("deletes multiple selected items when checkboxes are toggled and Delete is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act
    await user.click(screen.getByRole("button", { name: "Select Projects" }));
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));
    await user.click(screen.getByRole("button", { name: /Delete/i }));

    // Assert
    expect(
      await screen.findByText("This folder is empty")
    ).toBeInTheDocument();
  });

  it("switches between Light and Dark themes inside SettingsModal and persists to localStorage", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    // Act: open Settings from the desktop sidebar and select Light mode
    const desktopSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });
    await user.click(
      within(desktopSidebar).getByRole("button", { name: /Settings/i })
    );
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    await user.click(within(dialog).getByRole("button", { name: /Light/i }));

    // Assert: Light mode applied to document and saved to localStorage
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    // Act: switch to Dark mode
    await user.click(within(dialog).getByRole("button", { name: /Dark/i }));

    // Assert: Dark mode applied and persisted
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
