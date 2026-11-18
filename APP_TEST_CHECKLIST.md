<!-- ============================================================ -->
<!-- AI DIRECTIVE — BINDING TESTING & CHECKLIST INSTRUCTIONS       -->
<!-- Whenever you add or modify a feature, you must:               -->
<!-- 1. Add or update the automated test case in Section 4.        -->
<!-- 2. Add or update the manual cross-test item in Section 5.     -->
<!-- 3. Follow the Arrange-Act-Assert and test pyramid rules in    -->
<!--    Sections 2 and 3.                                          -->
<!-- ============================================================ -->

# One Place — Application Test Plan & Cross-Platform Checklist

**Last updated:** `2026-11-18`

---

## 1. Purpose of This Document

This file is the shared testing contract for **One Place** (`one-place`). It defines:
1. **Test Architecture & Layers** (Unit, UI Integration with Fake IPC, and E2E/Manual Cross-Testing).
2. **Test Format & Quality Rules** for both AI and developers.
3. **Automated Test Registry** (what is tested automatically via `yarn test`).
4. **Manual Cross-Platform Test Checklist** for **Windows**, **Ubuntu Linux**, and **Android**.

---

## 2. Test Layers (The Test Pyramid)

| Layer | Type | Runner & Tools | Scope & Speed |
| ----- | ---- | -------------- | ------------- |
| **Layer 1** | **Pure Unit Tests** (`*.test.ts`) | Vitest | Pure functions in isolation (`path-resolver`, `validation`, `history`, `sort-and-filter`, `selection`, `formatters`, `theme-logic`). Runs in milliseconds with zero OS/DOM dependencies. |
| **Layer 2** | **UI Integration Tests** (`*.test.tsx`) | Vitest + React Testing Library + JSDOM + `fake-tauri-fs` | Renders real React components (`ExplorerShell`, modals, toolbars) against an in-memory fake Tauri file system. Verifies what the user sees and clicks without touching the real disk. |
| **Layer 3** | **Cross-Platform E2E & Manual Verification** | `yarn dev` / `yarn tauri android dev` | Verifies real OS file system permissions, native dialogs, system file openers, and responsive layouts on **Windows**, **Ubuntu Linux**, and **Android**. |

---

## 3. Test Format & Operating Rules (For AI & Developers)

Every automated test in this repository must follow these conventions:

1. **Arrange, Act, Assert (AAA):**
   - Separate each test into `// Arrange`, `// Act`, and `// Assert` blocks.
   - Test **one behavior per test** with a descriptive sentence name (e.g., `navigates into a subfolder when Open is clicked and returns via Back button`).
2. **Test User-Visible Behavior:**
   - Query elements by accessible roles, labels, or visible text (`getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`), never by CSS class names or internal React state.
3. **Use Fakes Instead of Heavy Mocks:**
   - Use `src/test-support/fake-tauri-fs.ts` to seed deterministic in-memory directories and files before each UI integration test.
   - Reset the in-memory store before every test so tests can run alone, in any order, or in parallel.
4. **Commands to Run Tests:**

~~~bash
# Run all Unit (Layer 1) and UI Integration (Layer 2) tests
yarn test

# Run only Layer 1 pure unit tests (*.test.ts)
yarn test:unit

# Run only Layer 2 UI integration tests (*.test.tsx)
yarn test:integration

# Install Playwright Chromium browser (run once before first E2E test)
yarn playwright install chromium

# Run Layer 3 Playwright E2E tests (Desktop & Mobile viewports)
yarn test:e2e

# Run Rust backend tests
cd src-tauri && cargo test

# Android Dev Setup & Run (reconnect Wireless ADB first if PC/phone restarted)
adb connect 192.168.xxx.x:xxxxx
adb devices
yarn android:reverse
yarn android:grant-storage
yarn android:dev
~~~

---

## 4. Automated Test Registry (Layer 1 & Layer 2)

Status key: **Done** | **In progress** | **Planned**

### 4.1 Layer 1 — Pure Unit Tests (`*.test.ts`)

| Test File | Behaviors Covered | Status |
| --------- | ----------------- | ------ |
| `src/features/file-system/path-resolver.test.ts` | Windows/Unix slash normalization, `..` root escape prevention, path joining, parent resolution, breadcrumb generation, extension extraction, dotfile detection | Done |
| `src/features/file-system/validation.test.ts` | Cross-platform file/folder name validation (empty, `.` / `..`, forbidden symbols, Windows reserved names `CON`/`NUL`), `BaseDirectory` target mapping | Done |
| `src/features/navigation/navigation.test.ts` | Back/forward history stack, forward branch truncation, duplicate path prevention, hidden/search filtering, directory-first sorting | Done |
| `src/features/selection/selection.test.ts` | Single select, additive multi-toggle, select all, clear selection, clipboard staging | Done |
| `src/features/explorer/formatters.test.ts` | Byte size scaling (`B` to `TB`), UTC timestamp formatting, badge labels, custom mount label extraction, visual category classification | Done |
| `src/features/settings/theme-logic.test.ts` | Stored theme validation, fallback to `"system"`, effective Light/Dark resolution against OS media query | Done |

### 4.2 Layer 2 — UI Integration Tests (`*.test.tsx`)

| Test File | User Flows Covered | Status |
| --------- | ------------------ | ------ |
| `src/features/explorer/ExplorerShell.test.tsx` | Initial `Documents` directory rendering, subfolder navigation (`Open` + `Back`), sidebar root switching (`Downloads`), live search filtering and reset | Done |
| `src/features/explorer/ExplorerOperations.test.tsx` | Creating folders via `NamePromptModal`, invalid name alerts (`CON`), renaming, copy/paste into subfolders, deleting entries, multi-select checkboxes, Light/Dark `SettingsModal` | Done |
| `src/features/explorer/ExplorerViewAndNav.test.tsx` | Windows vs. Android `Home` root filtering, custom folder mounting (`Open Folder...`), `Up` / `Forward` / `Breadcrumb` / `Refresh` navigation, `List` view headers, `Hidden` dotfiles, and `Sort` controls | Done |
| `src/features/explorer/ExplorerSelectionAndFileOps.test.tsx` | `Multi-Select` mode toggle, `Select All` and `Clear`, `New File` creation, `Cut` (move) + `Paste Here`, and launching files via the native system opener (`openPath`) | Done |

---

## 5. Manual Cross-Platform Verification Checklist (Layer 3)

Check off `[x]` for each target platform (`Win` = Windows, `Linux` = Ubuntu Linux, `And` = Android) as you verify features in `yarn dev` or `yarn tauri android dev`.

### 5.1 Storage Locations & Path Navigation

| # | Test Scenario | Expected Result | Win | Linux | And |
| - | ------------- | --------------- | :-: | :---: | :-: |
| 1.1 | Launch app initially | Opens `Documents` root and lists real files/folders with item count in the footer | [x] | [x] | [x] |
| 1.2 | Click each standard root (`Documents`, `Downloads`, `Pictures`, `Videos`, `Music`, `App Storage`) | Loads the corresponding OS user folder without error | [x] | [x] | [x] |
| 1.3 | Check `Home` root visibility | `Home` is visible and browsable on Windows/Linux, and hidden on Android | [x] | [x] | [x] |
| 1.4 | Click `Open Folder...` (`Folder` on mobile) | Opens native OS folder picker; selecting a folder shows `Mounted Folder` in sidebar and lists contents | [x] | [x] | [x] |
| 1.5 | Open a subfolder, then click `Back`, `Forward`, `Up`, and `Refresh` | History buttons enable/disable accurately and return to expected folders | [x] | [x] | [x] |
| 1.6 | Click an ancestor segment in the Breadcrumb Address Bar | Jumps directly to that parent folder | [x] | [x] | [x] |
| 1.7 | Check `Drives` visibility (Windows, Linux & Android) | Lists mounted OS drives/volumes (`Drive (C:)`, `System Root (/)`, `Internal Storage`, `SD Card`) and browses their contents | [x] | [x] | [x] |

### 5.2 View Modes, Sorting & Filtering

| # | Test Scenario | Expected Result | Win | Linux | And |
| - | ------------- | --------------- | :-: | :---: | :-: |
| 2.1 | Switch between `Grid` and `List` view | Grid shows cards with large category icons; List shows table headers (`Name`, `Modified`, `Size`, `Action`) | [x] | [x] | [x] |
| 2.2 | Type in `Filter current folder...` and click `×` | Filters entries in real time by name; clicking `×` restores full folder list | [x] | [x] | [x] |
| 2.3 | Change `Sort` field (`Name`, `Size`, `Modified`, `Type`) and toggle `↑ ASC` / `↓ DESC` | Entries re-sort immediately while folders remain grouped above files | [x] | [x] | [x] |
| 2.4 | Toggle `Hidden` button | Dotfiles (e.g., `.git`, `.env`) appear when active and hide when inactive | [x] | [x] | [x] |

### 5.3 Selection Mechanics (Desktop & Touch)

| # | Test Scenario | Expected Result | Win | Linux | And |
| - | ------------- | --------------- | :-: | :---: | :-: |
| 3.1 | Click a card or row body | Selects that single item and shows contextual selection pill in action bar | [x] | [x] | [x] |
| 3.2 | Click the checkmark badge on multiple items | Toggles each item in/out of selection without clearing other selected items | [x] | [x] | [x] |
| 3.3 | Enable `Multi-Select` button and tap/click items | Every tap/click toggles selection (touch-friendly multi-select) | [x] | [x] | [x] |
| 3.4 | Click `Select All` then `Clear` | Selects all visible items in folder, then clears selection | [x] | [x] | [x] |

### 5.4 File & Folder Operations (CRUD & System Opener)

| # | Test Scenario | Expected Result | Win | Linux | And |
| - | ------------- | --------------- | :-: | :---: | :-: |
| 4.1 | Click `New Folder`, submit invalid name (`CON` or `a/b`), then valid name | Shows inline validation error for invalid name; creates folder on disk for valid name | [x] | [x] | [x] |
| 4.2 | Click `New File` and confirm `notes.txt` | Creates empty text file in active directory and refreshes list | [x] | [x] | [x] |
| 4.3 | Select 1 item, click `Rename`, enter new name | Renames file/folder on disk and updates view | [x] | [x] | [x] |
| 4.4 | Select item(s), click `Copy`, open another folder, click `Paste Here` | Copies selected file(s) into destination folder | [x] | [x] | [x] |
| 4.5 | Select item(s), click `Cut`, open another folder, click `Paste Here` | Moves selected item(s) to destination and clears clipboard button | [x] | [x] | [x] |
| 4.6 | Select test item(s) and click `Delete` | Removes selected item(s) from disk and updates item count | [x] | [x] | [x] |
| 4.7 | Double-click a file or click its `Open` button | Opens the file in the OS default application | [x] | [x] | [x] |

### 5.5 Themes & Responsive Layout

| # | Test Scenario | Expected Result | Win | Linux | And |
| - | ------------- | --------------- | :-: | :---: | :-: |
| 5.1 | Open `Settings` and switch between `Light`, `Dark`, and `System` | Entire UI (sidebar, address bar, cards, modals) updates contrast immediately | [x] | [x] | [x] |
| 5.2 | Close and relaunch app after selecting a theme | Saved theme preference persists via `localStorage` | [x] | [x] | [x] |
| 5.3 | Resize window narrow (`< 768px`) or run on Android | Left sidebar hides and fixed bottom icon bar appears cleanly | [x] | [x] | [x] |

---

## 6. How to Keep This File Updated (Instructions for AI)

- Whenever a new feature, user flow, or bug fix is implemented, update **Section 4** (Automated Test Registry) and **Section 5** (Manual Cross-Platform Verification Checklist) in the same response.
- Deliver updates using small anchor replacements rather than resending the entire file, unless the user asks for the full file.
