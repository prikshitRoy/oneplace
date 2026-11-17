// Pure state transitions for back, forward, and direct path navigation.

import { isSameVirtualPath, type VirtualPath } from "@/features/file-system";
import type { NavigationHistoryState } from "./types";

/** Creates a new navigation history initialized at the given starting path. */
export function createNavigationHistory(initialPath: VirtualPath): NavigationHistoryState {
  return {
    entries: [initialPath],
    currentIndex: 0,
  };
}

/** Returns the currently active VirtualPath from the history state. */
export function getCurrentPath(state: NavigationHistoryState): VirtualPath {
  return state.entries[state.currentIndex];
}

/** Returns true if the user can navigate backward in history. */
export function canNavigateBack(state: NavigationHistoryState): boolean {
  return state.currentIndex > 0;
}

/** Returns true if the user can navigate forward in history. */
export function canNavigateForward(state: NavigationHistoryState): boolean {
  return state.currentIndex < state.entries.length - 1;
}

/** Pushes a new path onto the history stack, discarding any forward history when branching. */
export function navigateToPath(
  state: NavigationHistoryState,
  targetPath: VirtualPath
): NavigationHistoryState {
  const activePath = getCurrentPath(state);
  // Avoid duplicate consecutive history entries when clicking the current folder
  if (isSameVirtualPath(activePath, targetPath)) {
    return state;
  }

  const keptEntries = state.entries.slice(0, state.currentIndex + 1);
  return {
    entries: [...keptEntries, targetPath],
    currentIndex: keptEntries.length,
  };
}

/** Moves one step backward in the history stack if possible. */
export function navigateBack(state: NavigationHistoryState): NavigationHistoryState {
  if (!canNavigateBack(state)) {
    return state;
  }
  return {
    ...state,
    currentIndex: state.currentIndex - 1,
  };
}

/** Moves one step forward in the history stack if possible. */
export function navigateForward(state: NavigationHistoryState): NavigationHistoryState {
  if (!canNavigateForward(state)) {
    return state;
  }
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
  };
}
