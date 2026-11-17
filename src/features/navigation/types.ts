// Data shapes for navigation history stacks, sorting, and filtering options.

import type { VirtualPath } from "@/features/file-system";

/** Fields available for sorting directory entries. */
export type SortField = "name" | "size" | "modifiedAt" | "extension";

/** Sort order direction. */
export type SortDirection = "asc" | "desc";

/** Active sorting configuration for an explorer view. */
export interface SortConfig {
  readonly field: SortField;
  readonly direction: SortDirection;
}

/** Active filter criteria for an explorer view. */
export interface FilterConfig {
  /** Case-insensitive substring matched against entry names. */
  readonly searchQuery: string;
  /** True when dot-files and hidden OS files should be included. */
  readonly shouldShowHidden: boolean;
}

/** Immutable history state tracking visited VirtualPaths in a session. */
export interface NavigationHistoryState {
  /** Ordered list of visited paths. */
  readonly entries: readonly VirtualPath[];
  /** Index of the active path inside entries. */
  readonly currentIndex: number;
}
