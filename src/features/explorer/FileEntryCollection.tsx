// Renders directory entries in either responsive Grid or List view mode.

import type { MouseEvent } from "react";
import type { FileEntry } from "@/features/file-system";
import { isPathSelected, type SelectionState } from "@/features/selection";
import {
  formatFileSize,
  formatModifiedDate,
  getEntryTypeBadge,
} from "./formatters";
import type { ExplorerViewMode } from "./types";

export interface FileEntryCollectionProps {
  readonly entries: readonly FileEntry[];
  readonly selectionState: SelectionState;
  readonly viewMode: ExplorerViewMode;
  readonly isMultiSelectMode: boolean;
  readonly onEntryActivate: (entry: FileEntry) => void;
  readonly onEntrySelect: (entry: FileEntry, isAdditive: boolean) => void;
}

/** Displays the list or grid of files and folders with unified desktop/mobile click handling. */
export function FileEntryCollection({
  entries,
  selectionState,
  viewMode,
  isMultiSelectMode,
  onEntryActivate,
  onEntrySelect,
}: FileEntryCollectionProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-sm text-neutral-500">
        No files or folders match this view.
      </div>
    );
  }

  /** Routes single click to selection (or multi-select) and Ctrl/Cmd+Click to additive toggle. */
  function handleItemClick(event: MouseEvent, entry: FileEntry): void {
    const isModifierHeld = event.ctrlKey || event.metaKey || isMultiSelectMode;
    onEntrySelect(entry, isModifierHeld);
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {entries.map((entry) => {
          const isSelected = isPathSelected(selectionState, entry.path);
          const isDirectory = entry.kind === "directory";
          return (
            <div
              key={`${entry.path.rootId}:${entry.path.relativePath}`}
              role="button"
              tabIndex={0}
              onClick={(event) => handleItemClick(event, entry)}
              onDoubleClick={() => onEntryActivate(entry)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onEntryActivate(entry);
                }
              }}
              className={`group flex cursor-pointer select-none flex-col justify-between rounded-lg border p-3 transition-colors ${
                isSelected
                  ? "border-sky-500 bg-sky-500/15"
                  : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
                    isDirectory
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {getEntryTypeBadge(entry)}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEntryActivate(entry);
                  }}
                  className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-neutral-300 hover:bg-sky-600 hover:text-white"
                >
                  Open
                </button>
              </div>

              <div className="mt-3">
                <p className="truncate text-xs font-medium text-neutral-100" title={entry.name}>
                  {entry.name}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {formatFileSize(entry.sizeBytes, isDirectory)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-800/70">
      {entries.map((entry) => {
        const isSelected = isPathSelected(selectionState, entry.path);
        const isDirectory = entry.kind === "directory";
        return (
          <div
            key={`${entry.path.rootId}:${entry.path.relativePath}`}
            role="button"
            tabIndex={0}
            onClick={(event) => handleItemClick(event, entry)}
            onDoubleClick={() => onEntryActivate(entry)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onEntryActivate(entry);
              }
            }}
            className={`flex cursor-pointer select-none items-center justify-between gap-3 px-3 py-2 text-xs transition-colors ${
              isSelected
                ? "bg-sky-500/15 text-white"
                : "text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className={`w-11 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold ${
                  isDirectory
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-neutral-800 text-neutral-300"
                }`}
              >
                {getEntryTypeBadge(entry)}
              </span>
              <span className="truncate font-medium">{entry.name}</span>
            </div>

            <div className="flex shrink-0 items-center gap-4 text-neutral-400">
              <span className="hidden sm:inline">
                {formatModifiedDate(entry.modifiedAtMs)}
              </span>
              <span className="w-16 text-right">
                {formatFileSize(entry.sizeBytes, isDirectory)}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEntryActivate(entry);
                }}
                className="rounded bg-neutral-800 px-2 py-1 text-[11px] font-medium text-neutral-200 hover:bg-sky-600 hover:text-white"
              >
                Open
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
