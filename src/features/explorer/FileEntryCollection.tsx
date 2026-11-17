// Renders directory entries in either visual Grid cards or structured List rows.

import type { MouseEvent } from "react";
import type { FileEntry } from "@/features/file-system";
import { isPathSelected, type SelectionState } from "@/features/selection";
import { EntryVisualIcon, SelectionCheckButton } from "./FileEntryIcons";
import {
  formatFileSize,
  formatModifiedDate,
  getEntryTypeBadge,
  getEntryVisualCategory,
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

/** Displays the visual grid cards or tabular list rows for the active folder. */
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
      <div className="flex flex-1 flex-col items-center justify-center p-16 text-center">
        <EntryVisualIcon category="folder" size="lg" />
        <p className="mt-3 text-sm font-medium text-foreground">
          This folder is empty
        </p>
        <p className="mt-1 text-xs text-muted">
          Create a new folder or file using the toolbar above.
        </p>
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
      <div className="grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {entries.map((entry) => {
          const isSelected = isPathSelected(selectionState, entry.path);
          const isDirectory = entry.kind === "directory";
          const category = getEntryVisualCategory(entry);

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
              className={`group relative flex cursor-pointer select-none flex-col justify-between rounded-2xl border p-3.5 transition-all ${
                isSelected
                  ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500"
                  : "border-border bg-panel hover:border-sky-500/50 hover:bg-elevated/60"
              }`}
            >
              {/* Top row: Category Icon + Checkbox & Open trigger */}
              <div className="flex items-start justify-between gap-2">
                <EntryVisualIcon category={category} size="lg" />

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEntryActivate(entry);
                    }}
                    className="rounded-md border border-border bg-elevated px-2 py-0.5 text-[10px] font-semibold text-foreground opacity-90 transition-colors hover:border-sky-500 hover:bg-sky-600 hover:text-white group-hover:opacity-100"
                  >
                    Open
                  </button>
                  <SelectionCheckButton
                    isSelected={isSelected}
                    entryName={entry.name}
                    onToggle={() => onEntrySelect(entry, true)}
                  />
                </div>
              </div>

              {/* Bottom row: Entry Name, Type Badge, and Size/Date */}
              <div className="mt-3.5">
                <p
                  className="truncate text-xs font-semibold text-foreground"
                  title={entry.name}
                >
                  {entry.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                  <span className="font-medium uppercase">
                    {isDirectory ? "Folder" : getEntryTypeBadge(entry)}
                  </span>
                  <span>{formatFileSize(entry.sizeBytes, isDirectory)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Structured List column header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-elevated/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted backdrop-blur">
        <span>Name</span>
        <div className="flex items-center gap-6">
          <span className="hidden w-32 text-right sm:inline">Modified</span>
          <span className="w-20 text-right">Size</span>
          <span className="w-14 text-right">Action</span>
        </div>
      </div>

      {/* File & Folder rows */}
      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const isSelected = isPathSelected(selectionState, entry.path);
          const isDirectory = entry.kind === "directory";
          const category = getEntryVisualCategory(entry);

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
              className={`group flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-2.5 text-xs transition-colors ${
                isSelected
                  ? "bg-sky-500/10 text-foreground"
                  : "bg-panel text-foreground hover:bg-elevated/60"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <SelectionCheckButton
                  isSelected={isSelected}
                  entryName={entry.name}
                  onToggle={() => onEntrySelect(entry, true)}
                />
                <EntryVisualIcon category={category} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold" title={entry.name}>
                    {entry.name}
                  </p>
                  <p className="text-[10px] text-muted sm:hidden">
                    {formatModifiedDate(entry.modifiedAtMs)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-6 text-muted">
                <span className="hidden w-32 text-right sm:inline">
                  {formatModifiedDate(entry.modifiedAtMs)}
                </span>
                <span className="w-20 text-right font-medium">
                  {formatFileSize(entry.sizeBytes, isDirectory)}
                </span>
                <div className="flex w-14 justify-end">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEntryActivate(entry);
                    }}
                    className="rounded-lg border border-border bg-elevated px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-sky-500 hover:bg-sky-600 hover:text-white"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
