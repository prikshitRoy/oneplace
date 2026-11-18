# One Place

**One Place** (`com.oneplace.app`) is a local-first, cross-platform file manager built for **Windows**, **Linux**, **macOS**, **Android**, and **iOS** from a single unified codebase using **Tauri v2**, **Next.js 14** (static export), **TypeScript**, and **Tailwind CSS**.

---

## Key Features

- **Cross-Platform Storage & Drive Navigation:** Browse standard user locations (`Documents`, `Downloads`, `Pictures`, `Videos`, `Music`, `App Storage`, and desktop `Home`), detected OS drives and volumes (`Drive (C:)`, `Drive (E:)` on Windows; `System Root (/)`, `/media/*`, `/mnt/*` on Linux; `Internal Storage` and `SD Card` on Android), or mount any directory via the native folder picker (`Open Folder...`).
- **Android Shared Storage & SAF Support:** Maps mobile tabs directly to `/storage/emulated/0/...` shared directories and decodes Android Storage Access Framework (`content://`) tree URIs into POSIX paths.
- **Full History & Breadcrumb Address Bar:** Navigate with `Back`, `Forward`, `Parent Folder (Up)`, `Refresh`, and clickable path segments inside a recessed address bar.
- **Visual Grid & Structured List Views:** Switch between card-based Grid view and tabular List view with category-coded vector icons for folders, images, videos, audio, archives, code, and documents.
- **Live Filtering & Directory-First Sorting:** Filter the active folder in real time, toggle hidden dotfiles (`.git`, `.env`), and sort by `Name`, `Size`, `Modified`, or `Type` (`ASC` / `DESC`) with folders pinned above files.
- **Mouse, Keyboard & Touch Selection:** Select items via single click, `Ctrl`/`Cmd` + click, individual card/row checkboxes, or the touch-friendly **Multi-Select** toggle mode.
- **File & Folder Operations (CRUD):** Create folders and text files with cross-platform filename validation (blocking reserved names like `CON`/`NUL` and invalid characters), rename, copy, cut/move across directories, delete, and launch files in their default OS application.
- **Adaptive Light, Dark & System Themes:** Instant theme switching backed by semantic CSS variables and persisted in `localStorage`.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Native Shell & IPC** | Tauri v2 (`2.12`), Rust (`2021` edition) |
| **Native Plugins** | `plugin-fs`, `plugin-dialog`, `plugin-os`, `plugin-opener` |
| **Frontend Framework** | Next.js `14.2.23` (`output: "export"`), React `18`, TypeScript `5` |
| **Styling** | Tailwind CSS `3.4` + CSS custom property theme tokens |
| **Unit & Integration Tests** | Vitest `2.1`, React Testing Library `16.1`, `jsdom` |
| **End-to-End (E2E) Tests** | Playwright `1.49` (Desktop Chrome & Mobile Pixel 7 viewports) |

---

## Project Architecture

All core path resolution, history stacks, sorting/filtering, and selection mechanics are written as pure, deterministic TypeScript functions with zero OS or DOM side effects, isolated from Tauri IPC adapters:

~~~text
one_place/
├── e2e/                        # Layer 3 Playwright E2E specs & browser Tauri IPC bridge
├── src/
│   ├── app/                    # Next.js App Router entry & global theme tokens
│   ├── features/
│   │   ├── file-system/        # VirtualPath resolver, validation, & Tauri FS/OS adapters
│   │   ├── navigation/         # Pure back/forward history stack, sort, & filter logic
│   │   ├── selection/          # Single/multi-select state & copy/cut clipboard staging
│   │   ├── explorer/           # Responsive ExplorerShell, toolbars, views, & RTL tests
│   │   └── settings/           # Light/Dark/System theme controller & SettingsModal
│   └── test-support/           # JSDOM setup & in-memory fake-tauri-fs test harness
├── src-tauri/                  # Rust backend, capability scopes, & Android target (gen/android)
├── APP_TEST_CHECKLIST.md       # Automated test registry & manual cross-platform checklist
└── PROJECT_OVERVIEW.md         # Architectural decisions & development changelog
~~~

---

## Getting Started

### 1. Install Dependencies

~~~bash
yarn
~~~

### 2. Run on Desktop (Windows, Linux, macOS)

~~~bash
yarn dev
~~~

*(On Ubuntu Linux, ensure `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libayatana-appindicator3-dev`, and `librsvg2-dev` are installed.)*

### 3. Run on Android (USB or Wireless ADB)

1. Ensure your Android device is connected via `adb devices` (and Windows Developer Mode is enabled on Windows 11 so symlinks are permitted).
2. Tunnel port `3000` over ADB and start the Android development build:

~~~bash
yarn android:reverse
yarn android:dev
~~~

3. Grant **All Files Access** (`MANAGE_EXTERNAL_STORAGE`) so **One Place** can read and manage shared storage folders:

~~~bash
yarn android:grant-storage
~~~

### 4. Build for Production

~~~bash
# Build desktop production bundle and installer
yarn build
~~~

---

## Running Automated Tests

**One Place** uses a 3-layer automated testing setup alongside the manual verification matrix in [`APP_TEST_CHECKLIST.md`](./APP_TEST_CHECKLIST.md):

~~~bash
# Run all Layer 1 (Unit) and Layer 2 (UI Integration) tests
yarn test

# Run only Layer 1 pure unit tests (*.test.ts)
yarn test:unit

# Run only Layer 2 React Testing Library UI integration tests (*.test.tsx)
yarn test:integration

# Install Playwright Chromium (once) and run Layer 3 Desktop & Mobile E2E tests
yarn playwright install chromium
yarn test:e2e

# Run Rust backend unit tests
cd src-tauri && cargo test
~~~

---

## Documentation

- [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) — Architecture, module registry, and chronological changelog.
- [`APP_TEST_CHECKLIST.md`](./APP_TEST_CHECKLIST.md) — Test pyramid rules, automated suite status, and cross-platform verification checklist for Windows, Linux, and Android.
