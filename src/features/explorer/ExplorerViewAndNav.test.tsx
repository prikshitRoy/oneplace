// Layer 2 UI integration tests for OS root filtering, custom folder mounting, breadcrumbs, and view/sort controls.

import { BaseDirectory } from "@tauri-apps/api/path";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
  setFakePickedFolder,
  type FakeFsNode,
} from "@/test-support/fake-tauri-fs";
import { ExplorerShell } from "./ExplorerShell";

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
    name: "alpha.txt",
    isDirectory: false,
    sizeBytes: 100,
    mtimeMs: Date.UTC(2026, 10, 17, 11, 0, 0),
  },
  {
    baseDir: BaseDirectory.Document,
    parentPath: "",
    name: "zeta.bin",
    isDirectory: false,
    sizeBytes: 5120,
    mtimeMs: Date.UTC(2026, 10, 17, 12, 0, 0),
  },
  {
    baseDir: BaseDirectory.Document,
    parentPath: "",
    name: ".env.local",
    isDirectory: false,
    sizeBytes: 64,
    mtimeMs: Date.UTC(2026, 10, 17, 8, 0, 0),
  },
  {
    baseDir: BaseDirectory.Document,
    parentPath: "Projects",
    name: "Specs",
    isDirectory: true,
    sizeBytes: 0,
    mtimeMs: Date.UTC(2026, 10, 17, 10, 30, 0),
  },
  {
    baseDir: BaseDirectory.Document,
    parentPath: "Projects/Specs",
    name: "design.pdf",
    isDirectory: false,
    sizeBytes: 2048,
    mtimeMs: Date.UTC(2026, 10, 17, 10, 45, 0),
  },
  {
    baseDir: undefined,
    parentPath: "E:/Workspace",
    name: "external-repo.rs",
    isDirectory: false,
    sizeBytes: 1024,
    mtimeMs: Date.UTC(2026, 10, 17, 15, 0, 0),
  },
  {
    baseDir: undefined,
    parentPath: "E:",
    name: "Software Projects",
    isDirectory: true,
    sizeBytes: 0,
    mtimeMs: Date.UTC(2026, 10, 17, 16, 0, 0),
  },
  {
    baseDir: undefined,
    parentPath: "mnt/work_ssd",
    name: "linux-builds",
    isDirectory: true,
    sizeBytes: 0,
    mtimeMs: Date.UTC(2026, 10, 17, 17, 0, 0),
  },
  {
    baseDir: undefined,
    parentPath: "storage/emulated/0",
    name: "DCIM",
    isDirectory: true,
    sizeBytes: 0,
    mtimeMs: Date.UTC(2026, 10, 17, 18, 0, 0),
  },
];

describe("ExplorerShell UI integration — Platform Roots, Navigation & Views", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeFileSystem(SEED_NODES, "windows");
  });

  it("shows Home location on Windows and hides Home on Android", async () => {
    // Arrange & Act: render on Windows first
    const { unmount } = render(<ExplorerShell />);
    await screen.findByText("Projects");
    const desktopSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });

    // Assert: Home is available on desktop OS
    expect(
      within(desktopSidebar).getByRole("button", { name: "Home" })
    ).toBeInTheDocument();
    unmount();

    // Arrange & Act: reset fake OS to Android and re-render
    resetFakeFileSystem(SEED_NODES, "android");
    render(<ExplorerShell />);
    await screen.findByText("Projects");
    const androidSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });

    // Assert: Home is excluded on mobile sandboxed OS
    expect(
      within(androidSidebar).queryByRole("button", { name: "Home" })
    ).not.toBeInTheDocument();
  });

  it("mounts a custom folder via Open Folder and displays its sidebar badge and files", async () => {
    // Arrange
    const user = userEvent.setup();
    setFakePickedFolder("E:\\Workspace");
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    // Act
    await user.click(screen.getByRole("button", { name: /Open Folder/i }));

    // Assert
    expect(await screen.findByText("external-repo.rs")).toBeInTheDocument();
    expect(screen.getByText("Mounted Folder")).toBeInTheDocument();
    expect(screen.getByText("Location: E:/Workspace")).toBeInTheDocument();
  });

  it("navigates via Up, Forward, Breadcrumb segments, and Refresh buttons", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    // Act: navigate into Projects -> Specs
    await user.click(screen.getAllByRole("button", { name: "Open" })[0]);
    await screen.findByText("Specs");
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("design.pdf")).toBeInTheDocument();

    // Act: click Up to go to parent (Projects), then Back and Forward
    await user.click(
      screen.getByRole("button", { name: "Navigate to parent folder" })
    );
    expect(await screen.findByText("Specs")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Navigate back" }));
    expect(await screen.findByText("design.pdf")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Navigate forward" }));
    expect(await screen.findByText("Specs")).toBeInTheDocument();

    // Act: click Documents in the Breadcrumb bar and then Refresh
    const breadcrumbNav = screen.getByRole("navigation", { name: "Breadcrumb" });
    await user.click(
      within(breadcrumbNav).getByRole("button", { name: "Documents" })
    );
    expect(await screen.findByText("alpha.txt")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Refresh directory" }));
    expect(await screen.findByText("alpha.txt")).toBeInTheDocument();
  });

  it("switches to List view, toggles Hidden dotfiles, and re-sorts entries by Size", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("alpha.txt");

    // Act: switch to List view and toggle Hidden files ON
    await user.click(screen.getByRole("button", { name: "List" }));
    await user.click(screen.getByRole("button", { name: /Hidden/i }));

    // Assert: List column header inside <main> and hidden .env.local file appear
    expect(within(screen.getByRole("main")).getByText("Modified")).toBeInTheDocument();
    expect(await screen.findByText(".env.local")).toBeInTheDocument();

    // Act: sort by Size and toggle direction to DESC
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by field" }),
      "size"
    );
    await user.click(screen.getByRole("button", { name: /ASC/i }));

    // Assert: button updates to DESC and entries remain rendered
    expect(screen.getByRole("button", { name: /DESC/i })).toBeInTheDocument();
    expect(screen.getByText("zeta.bin")).toBeInTheDocument();
  });


  it("displays detected Windows drives in the sidebar and navigates into a selected drive", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    const desktopSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });

    // Assert: Drive (C:) and Drive (E:) appear under Drives on Windows
    expect(
      await within(desktopSidebar).findByRole("button", { name: "Drive (C:)" })
    ).toBeInTheDocument();
    const driveEButton = within(desktopSidebar).getByRole("button", {
      name: "Drive (E:)",
    });

    // Act: click Drive (E:) in the sidebar
    await user.click(driveEButton);

    // Assert: loads root entries of E:/ and updates footer location
    expect(await screen.findByText("Software Projects")).toBeInTheDocument();
    expect(screen.getByText("Location: E:/")).toBeInTheDocument();
  });

  it("displays System Root (/) and mounted drives on Ubuntu Linux and navigates into them", async () => {
    // Arrange
    const user = userEvent.setup();
    resetFakeFileSystem(SEED_NODES, "linux");
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    const desktopSidebar = screen.getByRole("complementary", {
      name: "Storage locations",
    });

    // Assert: System Root (/) and Drive (work_ssd) appear under Drives on Linux
    expect(
      await within(desktopSidebar).findByRole("button", {
        name: "System Root (/)",
      })
    ).toBeInTheDocument();
    const linuxDriveButton = within(desktopSidebar).getByRole("button", {
      name: "Drive (work_ssd)",
    });

    // Act: click Drive (work_ssd)
    await user.click(linuxDriveButton);

    // Assert: loads mounted Linux drive entries and updates footer location
    expect(await screen.findByText("linux-builds")).toBeInTheDocument();
    expect(screen.getByText("Location: /mnt/work_ssd")).toBeInTheDocument();
  });

  it("displays Internal Storage and SD Card volumes on Android and navigates into Internal Storage", async () => {
    // Arrange
    const user = userEvent.setup();
    resetFakeFileSystem(SEED_NODES, "android");
    render(<ExplorerShell />);
    await screen.findByText("Projects");

    const mobileBottomBar = screen.getByRole("navigation", {
      name: "Mobile storage locations",
    });

    // Assert: Internal Storage and SD Card (1A2B-3C4D) appear in the mobile navigation bar
    const internalStorageBtn = await within(mobileBottomBar).findByRole(
      "button",
      { name: "Internal Storage" }
    );
    expect(
      within(mobileBottomBar).getByRole("button", {
        name: "SD Card (1A2B-3C4D)",
      })
    ).toBeInTheDocument();

    // Act: tap Internal Storage
    await user.click(internalStorageBtn);

    // Assert: loads full Android internal storage root (including DCIM)
    expect(await screen.findByText("DCIM")).toBeInTheDocument();
    expect(
      screen.getByText("Location: /storage/emulated/0")
    ).toBeInTheDocument();
  });

  it("navigates back on Android when swiping inward from the left or right screen edge", async () => {
    // Arrange
    const user = userEvent.setup();
    resetFakeFileSystem(SEED_NODES, "android");
    const { container } = render(<ExplorerShell />);
    await screen.findByText("Projects");

    // Act: open Projects -> Specs
    await user.click(screen.getAllByRole("button", { name: "Open" })[0]);
    await screen.findByText("Specs");
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("design.pdf")).toBeInTheDocument();

    const shellRoot = container.firstElementChild as HTMLElement;

    // Act 1: swipe inward from the right edge (x: 380 -> 260) to go back to Projects
    fireEvent.touchStart(shellRoot, {
      touches: [{ clientX: 380, clientY: 300 }],
    });
    fireEvent.touchEnd(shellRoot, {
      changedTouches: [{ clientX: 260, clientY: 302 }],
    });

    // Assert 1: navigated back from Specs to Projects
    expect(await screen.findByText("Specs")).toBeInTheDocument();

    // Wait past the 300ms back-gesture debounce window
    await new Promise((resolve) => setTimeout(resolve, 320));

    // Act 2: swipe inward from the left edge (x: 10 -> 120) to go back to Documents
    fireEvent.touchStart(shellRoot, {
      touches: [{ clientX: 10, clientY: 300 }],
    });
    fireEvent.touchEnd(shellRoot, {
      changedTouches: [{ clientX: 120, clientY: 305 }],
    });

    // Assert 2: navigated back to Documents root
    expect(await screen.findByText("Projects")).toBeInTheDocument();
  });
});
