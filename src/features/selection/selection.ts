// Pure functions for managing single, toggle, range, and select-all file selection.

import { isSameVirtualPath, type VirtualPath } from "@/features/file-system";
import type { ClipboardOperation, ClipboardState, SelectionState } from "./types";

/** Creates an empty initial selection state. */
export function createSelectionState(): SelectionState {
  return {
    selectedPaths: [],
    anchorPath: null,
  };
}

/** Checks whether the given target path is currently selected. */
export function isPathSelected(state: SelectionState, targetPath: VirtualPath): boolean {
  return state.selectedPaths.some((item) => isSameVirtualPath(item, targetPath));
}

/** Replaces the current selection with a single item and sets it as the anchor. */
export function selectSinglePath(
  targetPath: VirtualPath
): SelectionState {
  return {
    selectedPaths: [targetPath],
    anchorPath: targetPath,
  };
}

/** Toggles selection of a single item (used for Ctrl/Cmd+Click on desktop or tap in selection mode on mobile). */
export function togglePathSelection(
  state: SelectionState,
  targetPath: VirtualPath
): SelectionState {
  const alreadySelected = isPathSelected(state, targetPath);

  if (alreadySelected) {
    const remaining = state.selectedPaths.filter(
      (item) => !isSameVirtualPath(item, targetPath)
    );
    return {
      selectedPaths: remaining,
      anchorPath: remaining.length > 0 ? state.anchorPath : null,
    };
  }

  return {
    selectedPaths: [...state.selectedPaths, targetPath],
    anchorPath: targetPath,
  };
}

/** Selects all provided visible paths in the current directory. */
export function selectAllPaths(visiblePaths: readonly VirtualPath[]): SelectionState {
  return {
    selectedPaths: [...visiblePaths],
    anchorPath: visiblePaths[0] ?? null,
  };
}

/** Clears all selected items. */
export function clearSelection(): SelectionState {
  return createSelectionState();
}

/** Stages the provided paths into a clipboard state for copy or move. */
export function createClipboardState(
  operation: ClipboardOperation,
  items: readonly VirtualPath[]
): ClipboardState | null {
  if (items.length === 0) {
    return null;
  }
  return {
    operation,
    items: [...items],
  };
}
