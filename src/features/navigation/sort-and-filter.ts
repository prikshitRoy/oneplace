// Pure functions for filtering and sorting FileEntry lists with directories pinned first.

import type { FileEntry } from "@/features/file-system";
import type { FilterConfig, SortConfig } from "./types";

/** Filters entries by hidden status and case-insensitive search substring. */
export function filterFileEntries(
  entries: readonly FileEntry[],
  filter: FilterConfig
): FileEntry[] {
  const normalizedQuery = filter.searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    if (!filter.shouldShowHidden && entry.isHidden) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return entry.name.toLowerCase().includes(normalizedQuery);
  });
}

/** Compares two FileEntry items by the chosen sort field without mutating the source array. */
function compareByField(first: FileEntry, second: FileEntry, config: SortConfig): number {
  switch (config.field) {
    case "size":
      return first.sizeBytes - second.sizeBytes;
    case "modifiedAt":
      return (first.modifiedAtMs ?? 0) - (second.modifiedAtMs ?? 0);
    case "extension":
      return first.extension.localeCompare(second.extension, undefined, {
        sensitivity: "base",
      });
    case "name":
    default:
      return first.name.localeCompare(second.name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
  }
}

/** Sorts entries while keeping directories grouped above files, matching standard file managers. */
export function sortFileEntries(
  entries: readonly FileEntry[],
  config: SortConfig
): FileEntry[] {
  const directionMultiplier = config.direction === "asc" ? 1 : -1;

  return [...entries].sort((first, second) => {
    const isFirstDir = first.kind === "directory";
    const isSecondDir = second.kind === "directory";

    // Always keep directories above files regardless of sort direction
    if (isFirstDir !== isSecondDir) {
      return isFirstDir ? -1 : 1;
    }

    const fieldComparison = compareByField(first, second, config);
    if (fieldComparison !== 0) {
      return fieldComparison * directionMultiplier;
    }

    // Tie-break deterministically by name
    return first.name.localeCompare(second.name, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}
