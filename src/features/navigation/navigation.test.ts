// Unit tests for navigation history stacks and directory entry sorting/filtering.

import { describe, expect, it } from "vitest";
import { createVirtualPath, type FileEntry } from "@/features/file-system";
import {
  canNavigateBack,
  canNavigateForward,
  createNavigationHistory,
  getCurrentPath,
  navigateBack,
  navigateForward,
  navigateToPath,
} from "./history";
import { filterFileEntries, sortFileEntries } from "./sort-and-filter";

const SAMPLE_ENTRIES: readonly FileEntry[] = [
  {
    name: "notes.txt",
    extension: "txt",
    path: createVirtualPath("documents", "notes.txt"),
    kind: "file",
    sizeBytes: 250,
    modifiedAtMs: 1000,
    isHidden: false,
  },
  {
    name: "Archive",
    extension: "",
    path: createVirtualPath("documents", "Archive"),
    kind: "directory",
    sizeBytes: 0,
    modifiedAtMs: 500,
    isHidden: false,
  },
  {
    name: ".secret",
    extension: "",
    path: createVirtualPath("documents", ".secret"),
    kind: "file",
    sizeBytes: 900,
    modifiedAtMs: 2000,
    isHidden: true,
  },
];

describe("navigation history state machine", () => {
  it("tracks back and forward movement and truncates forward history on branch", () => {
    // Arrange
    const root = createVirtualPath("documents", "");
    const photos = createVirtualPath("pictures", "");
    const downloads = createVirtualPath("downloads", "");

    // Act
    let state = createNavigationHistory(root);
    state = navigateToPath(state, photos);
    state = navigateBack(state);
    const canGoForwardBeforeBranch = canNavigateForward(state);
    state = navigateToPath(state, downloads);

    // Assert
    expect(canGoForwardBeforeBranch).toBe(true);
    expect(canNavigateBack(state)).toBe(true);
    expect(canNavigateForward(state)).toBe(false);
    expect(getCurrentPath(state)).toEqual(downloads);
  });

  it("does not push a duplicate entry when navigating to the current path", () => {
    // Arrange
    const root = createVirtualPath("documents", "Work");
    const initialState = createNavigationHistory(root);

    // Act
    const nextState = navigateToPath(initialState, createVirtualPath("documents", "Work"));

    // Assert
    expect(nextState.entries).toHaveLength(1);
  });
});

describe("filterFileEntries and sortFileEntries", () => {
  it("hides hidden entries when shouldShowHidden is false and matches search query", () => {
    // Arrange
    const filter = { searchQuery: "note", shouldShowHidden: false };

    // Act
    const result = filterFileEntries(SAMPLE_ENTRIES, filter);

    // Assert
    expect(result.map((entry) => entry.name)).toEqual(["notes.txt"]);
  });

  it("keeps directories above files even when sorting by size descending", () => {
    // Arrange
    const visibleEntries = filterFileEntries(SAMPLE_ENTRIES, {
      searchQuery: "",
      shouldShowHidden: true,
    });

    // Act
    const sorted = sortFileEntries(visibleEntries, {
      field: "size",
      direction: "desc",
    });

    // Assert
    expect(sorted.map((entry) => entry.name)).toEqual([
      "Archive",
      ".secret",
      "notes.txt",
    ]);
  });
});

import {
  isInwardEdgeBackSwipe,
  resolveBackNavigationAction,
} from "./back-gesture";

describe("isInwardEdgeBackSwipe & resolveBackNavigationAction", () => {
  it("detects inward horizontal swipes from both the left and right screen edges", () => {
    expect(
      isInwardEdgeBackSwipe({
        startX: 12,
        startY: 300,
        endX: 100,
        endY: 305,
        viewportWidth: 390,
      })
    ).toBe(true);

    expect(
      isInwardEdgeBackSwipe({
        startX: 378,
        startY: 300,
        endX: 280,
        endY: 295,
        viewportWidth: 390,
      })
    ).toBe(true);

    expect(
      isInwardEdgeBackSwipe({
        startX: 180,
        startY: 300,
        endX: 280,
        endY: 300,
        viewportWidth: 390,
      })
    ).toBe(false);
  });

  it("prioritizes closing modals and clearing selection before folder history back", () => {
    expect(
      resolveBackNavigationAction({
        hasOpenModal: true,
        hasSelection: true,
        isMultiSelectMode: false,
        canNavigateBack: true,
        hasParentDirectory: true,
      })
    ).toBe("close-modal");

    expect(
      resolveBackNavigationAction({
        hasOpenModal: false,
        hasSelection: true,
        isMultiSelectMode: false,
        canNavigateBack: true,
        hasParentDirectory: true,
      })
    ).toBe("clear-selection");

    expect(
      resolveBackNavigationAction({
        hasOpenModal: false,
        hasSelection: false,
        isMultiSelectMode: false,
        canNavigateBack: true,
        hasParentDirectory: true,
      })
    ).toBe("history-back");
  });
});