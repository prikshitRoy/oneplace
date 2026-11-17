// Unit tests for item selection and clipboard state functions.

import { describe, expect, it } from "vitest";
import { createVirtualPath } from "@/features/file-system";
import {
  clearSelection,
  createClipboardState,
  createSelectionState,
  isPathSelected,
  selectAllPaths,
  selectSinglePath,
  togglePathSelection,
} from "./selection";

describe("selection state functions", () => {
  it("toggles multiple paths on and off without duplicating entries", () => {
    // Arrange
    const firstFile = createVirtualPath("documents", "a.txt");
    const secondFile = createVirtualPath("documents", "b.txt");
    let state = createSelectionState();

    // Act
    state = togglePathSelection(state, firstFile);
    state = togglePathSelection(state, secondFile);
    state = togglePathSelection(state, firstFile);

    // Assert
    expect(isPathSelected(state, firstFile)).toBe(false);
    expect(isPathSelected(state, secondFile)).toBe(true);
    expect(state.selectedPaths).toHaveLength(1);
  });

  it("replaces selection on selectSinglePath and resets on clearSelection", () => {
    // Arrange
    const firstFile = createVirtualPath("documents", "a.txt");
    const secondFile = createVirtualPath("documents", "b.txt");

    // Act
    const selectedState = selectAllPaths([firstFile, secondFile]);
    const singleState = selectSinglePath(secondFile);
    const clearedState = clearSelection();

    // Assert
    expect(selectedState.selectedPaths).toHaveLength(2);
    expect(singleState.selectedPaths).toEqual([secondFile]);
    expect(clearedState.selectedPaths).toHaveLength(0);
  });
});

describe("createClipboardState", () => {
  it("returns null when staging an empty path list", () => {
    // Arrange & Act
    const clipboard = createClipboardState("copy", []);

    // Assert
    expect(clipboard).toBeNull();
  });
});
