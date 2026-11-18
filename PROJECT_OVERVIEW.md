<!-- ============================================================ -->
<!-- AI DIRECTIVE — THIS IS AN INSTRUCTION, NOT PROJECT CONTENT.   -->
<!-- Everything from "## 1. What Is This Project?" down to        -->
<!-- "## 7. How to Run" is descriptive background about the       -->
<!-- project, filled in as the project grows. This note, and the  -->
<!-- final section "How to Keep This File Updated (Instructions   -->
<!-- for AI)," are NOT background — they are operating rules you  -->
<!-- must follow in every response that changes the project.      -->
<!-- Do not treat this as a header to skim past.                  -->
<!-- ============================================================ -->

# Project Overview

> ⚠️ **Instruction for AI (binding, not descriptive):** This file is the single source of truth for what this project is and what has been built so far. See **"How to Keep This File Updated (Instructions for AI)"** at the bottom — those are operating rules you must act on in every response that changes the project, not prose describing the project.

**Last updated:** `2026-11-17`

---

## 1. What Is This Project?

**Name:** `One Place` (`one-place`)

A local-first, cross-platform file manager built with Tauri v2 and Next.js 14 (static export) that runs on Windows, Linux, macOS, Android, and iOS from a single unified codebase.

Designed for users who want a fast, consistent file browsing and management experience across desktop and mobile devices without platform-specific code forks.

## 2. Tech Stack

| Area              | Choice                                                   |
| ----------------- | -------------------------------------------------------- |
| Languages         | TypeScript 5, Rust (2021 edition)                        |
| Frontend          | Next.js 14.2.23 (`output: "export"`), React 18           |
| Styling           | Tailwind CSS 3.4.1, PostCSS 8                            |
| Backend / Runtime | Tauri 2.12 (`plugin-fs`, `plugin-dialog`, `plugin-os`, `plugin-opener`) |
| Package managers  | Yarn (`yarn.lock`), Cargo (`src-tauri/Cargo.lock`)       |
| Tests             | Vitest ^2.1.8, React Testing Library ^16.1.0, Playwright ^1.49.0, `cargo test` |
| Target platforms  | Windows, Linux, macOS, Android, iOS                      |

Planned: Android/iOS mobile scaffolding (`yarn tauri android init` / `yarn tauri ios init`).

## 3. Core Concepts

- **`VirtualPath`**: A normalized, platform-agnostic path object combining a logical root (e.g., `Document`, `Download`, or a desktop drive root) with a forward-slash relative path.
- **`FileEntry`**: The shared data contract representing a file or directory (name, virtual path, kind, size in bytes, modified timestamp, and hidden flag).
- **`StorageRoot`**: A top-level browsable location (standard user folders on all platforms, plus mounted drives on desktop).
- **`ExplorerSession`**: The isolated navigation state for a view, holding current `VirtualPath`, back/forward history stacks, sort order, and active selection.

## 4. Features

Status key: **Done** | **In progress** | **Planned**

### 4.1 Foundation & Scaffolding

| Feature                                                        | Status  |
| -------------------------------------------------------------- | ------- |
| Desktop Tauri v2 + Next.js 14 SSG template setup               | Done    |
| Mobile target initialization (`gen/android`) & storage scopes  | Done    |
| Tauri FS, Dialog, and OS plugin integration & capabilities     | Done    |

### 4.2 File System Service (`src/features/file-system/`)

| Feature                                                        | Status  |
| -------------------------------------------------------------- | ------- |
| Cross-platform path normalization and `VirtualPath` resolver   | Done    |
| Directory listing with metadata (size, modified date, type)    | Done    |
| File/folder create, rename, copy, move, and delete operations  | Done    |
| Native file opener integration (`@tauri-apps/plugin-opener`)   | Done    |

### 4.3 Navigation & Selection (`src/features/navigation/`, `src/features/selection/`)

| Feature                                                        | Status  |
| -------------------------------------------------------------- | ------- |
| Back, forward, and parent directory history stack              | Done    |
| Breadcrumb path parser and quick-jump segments                 | Done    |
| Single and multi-item selection (keyboard + touch long-press)  | Done    |
| Search and sort (by name, size, date, type)                    | Done    |

### 4.4 Adaptive UI (`src/features/explorer/`)

| Feature                                                        | Status  |
| -------------------------------------------------------------- | ------- |
| Responsive shell (sidebar on desktop, bottom bar on mobile)    | Done    |
| Grid and list view modes for directory contents                | Done    |
| Contextual action toolbar and modal prompt for file operations | Done    |
| User Settings modal with Light, Dark, and System theme modes   | Done    |

## 5. Known Issues and Open Items

> Verify these against the current code; remove an item when it is fixed.

- Mobile folders (`src-tauri/gen/android` and `src-tauri/gen/apple`) are not yet initialized in the template (run `yarn tauri android init` when Android SDK/NDK is ready).

## 6. Project Structure

```text
tauri-2.0-nextjs-14.2.23-template/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router root layout and entry page
│   └── features/               # Modular feature directories
│       ├── file-system/        # VirtualPath contracts, path resolver, Tauri FS/Dialog/Opener  adapters, & tests
│       ├── navigation/         # Pure history stack, sorting, filtering, & unit tests
│       ├── selection/          # Pure item selection, clipboard state, & unit tests
│       ├── explorer/           # Responsive ExplorerShell, toolbars, grid/list views, & UI tests
│       └── settings/           # Light/Dark/System theme logic, storage hook, SettingsModal, & tests
│   └── test-support/           # JSDOM test setup and in-memory Fake Tauri File System harness
└── src-tauri/
    ├── capabilities/           # Tauri v2 permission scopes (desktop & mobile)
    ├── icons/                  # App icons for all target platforms
    └── src/                    # Rust entry points (main.rs, lib.rs) and native commands
```

## 7. How to Run

```bash
# Install frontend dependencies
yarn

# Run desktop development mode
yarn dev

# Run Android development mode (tunnel port 3000 via ADB, grant All Files Access, and launch)
yarn android:reverse
yarn android:grant-storage
yarn android:dev

# Run frontend Unit (Layer 1), UI Integration (Layer 2), and Playwright E2E (Layer 3) tests
yarn test
yarn test:unit
yarn test:integration
yarn playwright install chromium
yarn test:e2e

# Run Rust backend tests
cd src-tauri && cargo test

# Build production application
yarn build
```

## 8. Changelog

> Newest entry on top. One line per change: date — what changed.

- `2026-11-18` — Added Android status bar / camera cutout safe-area spacing and consecutive left/right edge-swipe back navigation (`back-gesture.ts`, `MainActivity.kt` `OnBackPressedCallback`, and `ExplorerShell.tsx`).
- `2026-11-18` — Added Android storage volume visibility (`parse_android_mounts` for `Internal Storage` `/storage/emulated/0` and removable `/storage/<UUID>` SD/OTG volumes, plus mobile bottom bar drive buttons).
- `2026-11-18` — Added Ubuntu Linux drive and mount visibility (`parse_linux_mounts` in Rust for `/`, `/media/*`, `/run/media/*`, and `/mnt/*`, plus `formatSystemDriveLabel` and Linux UI integration tests).
- `2026-11-18` — Added Windows drive detection (`list_system_drives` in Rust + `FsExt` scope registration, `getAvailableSystemDrives`, and sidebar `Drives` section in `StorageNavigation`).
- `2026-11-18` — Completed full automated and manual cross-platform verification on Ubuntu Linux, Windows, and Android (`APP_TEST_CHECKLIST.md`).
- `2026-11-18` — Configured Android storage permissions (`AndroidManifest.xml`), mapped Android shared storage roots (`/storage/emulated/0/...`), added SAF folder picker URI normalization, and documented Android/E2E commands.
- `2026-11-18` — Added Layer 3 Playwright E2E test suite (`playwright.config.ts`, `e2e/tauri-ipc-bridge.ts`, `e2e/explorer.spec.ts`) for Desktop and Mobile viewports.
- `2026-11-17` — Added `ExplorerViewAndNav.test.tsx` and `ExplorerSelectionAndFileOps.test.tsx` to achieve 100% Layer 2 UI integration test coverage across all checklist flows.
- `2026-11-17` — Completed Layer 2 UI integration test suite (`ExplorerOperations.test.tsx`) covering folder/file creation, validation alerts, rename, copy/paste, multi-delete, and Light/Dark theme switching.
- `2026-11-17` — Added `APP_TEST_CHECKLIST.md`, configured Layer 2 UI integration testing (`@testing-library/react`, `jsdom`, `fake-tauri-fs.ts`), and added `ExplorerShell.test.tsx` (Part 1).
- `2026-11-17` — Completed Step 5 UI polish: decluttered `ActionToolbar` with `ActionIcons`, updated `NamePromptModal` for Light/Dark themes, and streamlined `ExplorerShell` status bar.
- `2026-11-17` — Upgraded `FileEntryCollection` with category-colored folder/file icons (`FileEntryIcons`), one-click selection checkboxes, and structured List view headers.
- `2026-11-17` — Redesigned `ExplorerToolbar` with icon navigation cluster (`ToolbarIcons`), recessed breadcrumb address bar, search clear button, and segmented Grid/List view toggle.
- `2026-11-17` — Upgraded `StorageNavigation` with SVG location icons (`ExplorerIcons`), mounted custom folder indicator, and integrated Settings trigger.
- `2026-11-17` — Fixed Tailwind `src/features` content scanning and added `settings` module with Light, Dark, and System theme switching.
- `2026-11-17` — Built Phase 4 adaptive `explorer` UI (`ExplorerShell`, toolbars, grid/list views, modal prompt, pure formatters + unit tests) and wired into `src/app/page.tsx`.
- `2026-11-17` — Implemented Phase 3 Tauri file system adapter (`directory-reader`, `file-operations`, `tauri-target`, `validation`) with unit tests and capability permissions.
- `2026-11-17` — Added pure `file-system` path resolver, `navigation` history/sort/filter, and `selection` modules with Vitest unit tests.
- `2026-11-17` — Renamed app to "One Place" (`one-place`), updated `.gitignore`, configured Tauri `fs`/`dialog`/`os` plugins and capabilities, and added Vitest.
- `2026-11-17` — Initialized `PROJECT_OVERVIEW.md` with cross-platform file manager architecture and feature roadmap.

---

## How to Keep This File Updated (Instructions for AI)

**Update this file in the same response as the change**, whenever you:

- Add a new feature, module, or screen.
- Change how an existing feature works.
- Fix a bug listed in "Known Issues" (remove it) or find a new one (add it).
- Change the tech stack, a dependency, a command, or the folder structure.
- Remove or replace a feature.

**How to do it:**

1. Update the feature's **status** (`Planned` → `In progress` → `Done`) or add a new row in the right table in section 4.
2. Update sections 2, 3, 5, 6, or 7 if they are affected.
3. Add **one line** to the top of section 8 (Changelog) with the date and what changed.
4. Update the **Last updated** date at the top.
5. Keep it **short and accurate**: describe *what the project does*, not line-by-line code. No stale or guessed information.

**How to deliver the update to me:**

- Do **not** resend the whole file each time.
- For a small change (up to ~4 lines), give the old text to find and the new text to replace it with.
- For a larger change, give the new block with the first 2 and last 2 lines of the old block as anchors.
- Always say which **section** the change goes in. Only give the full file when I ask for it or when the changes are very large.
- If you are unsure whether something counts as done, ask me instead of guessing.
- I will ask for the updated PROJECT_OVERVIEW.md file at the end of a work session. Read all the changes discussed and return the full updated file then.
