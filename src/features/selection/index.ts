// Public API for the selection and clipboard feature module.

export type {
  ClipboardOperation,
  ClipboardState,
  SelectionState,
} from "./types";

export {
  clearSelection,
  createClipboardState,
  createSelectionState,
  isPathSelected,
  selectAllPaths,
  selectSinglePath,
  togglePathSelection,
} from "./selection";
