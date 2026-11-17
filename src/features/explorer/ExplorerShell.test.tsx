// Layer 2 UI integration tests for ExplorerShell navigation, root switching, and filtering.

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

// Wire Tauri side-effect plugins to our deterministic in-memory fake file system
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
  {
    baseDir: BaseDirectory.Document,
    parentPath: "Projects",
    name: "architecture.pdf",
    isDirectory: false,
    sizeBytes: 1048576,
    mtimeMs: Date.UTC(2026, 10, 17, 12, 0, 0),
  },
  {
    baseDir: BaseDirectory.Download,
    parentPath: "",
    name: "installer.exe",
    isDirectory: false,
    sizeBytes: 4096,
    mtimeMs: Date.UTC(2026, 10, 17, 9, 0, 0),
  },
];

describe("ExplorerShell UI integration — Navigation & Filtering", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeFileSystem(SEED_NODES, "windows");
  });

  it("renders initial Documents directory entries and updates item count in footer", async () => {
    // Arrange & Act
    render(<ExplorerShell/>);

    // Assert
    expect(await screen.findByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("roadmap.md")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("navigates into a subfolder when Open is clicked and returns via Back button", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell/>);
    await screen.findByText("Projects");

    // Act: click the Open button inside the Projects card
    const openButtons = screen.getAllByRole("button", { name: "Open" });
    await user.click(openButtons[0]);

    // Assert: nested file is displayed and breadcrumb shows Projects
    expect(await screen.findByText("architecture.pdf")).toBeInTheDocument();
    expect(screen.getByText("1 MB")).toBeInTheDocument();

    // Act: click Back button in the top toolbar
    await user.click(screen.getByRole("button", { name: "Navigate back" }));

    // Assert: returned to root Documents directory
    expect(await screen.findByText("roadmap.md")).toBeInTheDocument();
  });

  it("switches between storage roots when clicking Downloads in the sidebar", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell/>);
    await screen.findByText("roadmap.md");

    // Act
    const desktopSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });
    await user.click(
      within(desktopSidebar).getByRole("button", { name: "Downloads" })
    );

    // Assert
    expect(await screen.findByText("installer.exe")).toBeInTheDocument();
    expect(screen.queryByText("roadmap.md")).not.toBeInTheDocument();
  });

  it("filters visible entries when typing in the folder search box and clears on reset", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell/>);
    await screen.findByText("roadmap.md");

    // Act: type a filter query matching only roadmap.md
    const searchInput = screen.getByRole("searchbox", {
      name: "Filter current folder",
    });
    await user.type(searchInput, "road");

    // Assert: only roadmap.md remains visible
    expect(screen.getByText("roadmap.md")).toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();

    // Act: clear the search filter
    await user.click(screen.getByRole("button", { name: "Clear search filter" }));

    // Assert: both entries are visible again
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });
});
