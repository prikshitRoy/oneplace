// Data contracts for item selection and copy/cut clipboard operations.

import type { VirtualPath } from "@/features/file-system";

/** Operation type for staged clipboard items. */
export type ClipboardOperation = "copy" | "move";

/** Staged clipboard payload for copy or cut actions. */
export interface ClipboardState {
  readonly operation: ClipboardOperation;
  readonly items: readonly VirtualPath[];
}

/** Selection state for the active directory view. */
export interface SelectionState {
  /** Currently selected file or folder paths. */
  readonly selectedPaths: readonly VirtualPath[];
  /** Last clicked path, used as an anchor for range selection. */
  readonly anchorPath: VirtualPath | null;
}
