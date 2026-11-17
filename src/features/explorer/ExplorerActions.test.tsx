// Layer 2 UI integration tests for file CRUD operations, multi-selection, clipboard, and theme switching.

import { BaseDirectory } from "@tauri-apps/api/path";
import { render, screen, within } from "@testing-library/react";
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
  resetFakeFileSystem,
  type FakeFsNode,
} from "@/test-support/fake-tauri-fs";
import { ExplorerShell } from "./ExplorerShell";

// Connect Tauri plugins to the deterministic in-memory fake file system
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

  it("blocks invalid folder names with an alert and creates a valid new folder", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: open New Folder modal and submit reserved name "CON"
    await user.click(screen.getByRole("button", { name: /New Folder/i }));
    const nameInput = screen.getByPlaceholderText("Enter name...");
    await user.type(nameInput, "CON");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert: validation error alert is shown and modal remains open
    expect(screen.getByRole("alert")).toHaveTextContent(
      '"CON" is a reserved system name.'
    );

    // Act: replace with a valid folder name and submit
    await user.clear(nameInput);
    await user.type(nameInput, "Invoices");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert: new folder appears in the directory view
    expect(await screen.findByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("renames a selected file via the contextual Rename button", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: select roadmap.md using its checkbox and click Rename
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));
    await user.click(screen.getByRole("button", { name: /Rename/i }));

    const nameInput = screen.getByPlaceholderText("Enter name...");
    await user.clear(nameInput);
    await user.type(nameInput, "roadmap-v2.md");
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Assert: updated name is rendered and old name is removed
    expect(await screen.findByText("roadmap-v2.md")).toBeInTheDocument();
    expect(screen.queryByText("roadmap.md")).not.toBeInTheDocument();
  });

  it("copies a selected file and pastes it into a subfolder", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: select roadmap.md, click Copy, open Projects folder, and click Paste Here
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));
    await user.click(screen.getByRole("button", { name: /Copy/i }));

    const openButtons = screen.getAllByRole("button", { name: "Open" });
    await user.click(openButtons[0]);

    const pasteButton = await screen.findByRole("button", {
      name: /Paste Here \(1 copied\)/i,
    });
    await user.click(pasteButton);

    // Assert: copied file now exists inside the Projects subfolder
    expect(await screen.findByText("roadmap.md")).toBeInTheDocument();
  });

  it("multi-selects items via checkboxes and deletes them to show the empty state", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: select both Projects and roadmap.md via their selection checkboxes
    await user.click(screen.getByRole("button", { name: "Select Projects" }));
    await user.click(screen.getByRole("button", { name: "Select roadmap.md" }));

    // Assert: contextual pill shows 2 selected
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    // Act: click Delete
    await user.click(screen.getByRole("button", { name: /Delete/i }));

    // Assert: directory is now empty
    expect(
      await screen.findByText("This folder is empty")
    ).toBeInTheDocument();
  });

  it("switches from Dark to Light theme inside the Settings modal", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("roadmap.md");

    // Act: open Settings from the desktop sidebar and select Light mode
    const desktopSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });
    await user.click(
      within(desktopSidebar).getByRole("button", { name: /Settings/i })
    );

    const dialog = screen.getByRole("dialog", { name: "Settings" });
    await user.click(within(dialog).getByRole("button", { name: /Light/i }));

    // Assert: root html element reflects light mode and persists in localStorage
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("one-place:theme-mode")).toBe("light");
  });
});
