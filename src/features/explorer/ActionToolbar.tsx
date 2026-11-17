// Contextual action bar for creating items and acting on selected or clipboard entries.

import type { ClipboardState } from "@/features/selection";

export interface ActionToolbarProps {
  readonly selectedCount: number;
  readonly isMultiSelectMode: boolean;
  readonly clipboardState: ClipboardState | null;
  readonly onOpenCreateFolder: () => void;
  readonly onOpenCreateFile: () => void;
  readonly onToggleMultiSelectMode: () => void;
  readonly onSelectAll: () => void;
  readonly onClearSelection: () => void;
  readonly onRenameSelected: () => void;
  readonly onCopySelected: () => void;
  readonly onMoveSelected: () => void;
  readonly onPasteClipboard: () => void;
  readonly onDeleteSelected: () => void;
}

/** Renders folder/file creation buttons and selection/clipboard actions. */
export function ActionToolbar({
  selectedCount,
  isMultiSelectMode,
  clipboardState,
  onOpenCreateFolder,
  onOpenCreateFile,
  onToggleMultiSelectMode,
  onSelectAll,
  onClearSelection,
  onRenameSelected,
  onCopySelected,
  onMoveSelected,
  onPasteClipboard,
  onDeleteSelected,
}: ActionToolbarProps) {
  const hasSelection = selectedCount > 0;
  const isSingleSelected = selectedCount === 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs">
      {/* Creation and touch multi-select controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenCreateFolder}
          className="rounded bg-sky-600 px-2.5 py-1 font-medium text-white hover:bg-sky-500"
        >
          + New Folder
        </button>
        <button
          type="button"
          onClick={onOpenCreateFile}
          className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 font-medium text-neutral-200 hover:border-neutral-500"
        >
          + New File
        </button>
        <button
          type="button"
          onClick={onToggleMultiSelectMode}
          className={`rounded border px-2.5 py-1 font-medium ${
            isMultiSelectMode
              ? "border-amber-500 bg-amber-500/20 text-amber-300"
              : "border-neutral-700 bg-neutral-800 text-neutral-300"
          }`}
        >
          {isMultiSelectMode ? "Multi-Select: ON" : "Multi-Select"}
        </button>
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-300 hover:text-white"
        >
          Select All
        </button>
      </div>

      {/* Contextual selection and clipboard actions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {clipboardState && (
          <button
            type="button"
            onClick={onPasteClipboard}
            className="rounded bg-emerald-600 px-2.5 py-1 font-medium text-white hover:bg-emerald-500"
          >
            Paste ({clipboardState.items.length} {clipboardState.operation})
          </button>
        )}

        {hasSelection && (
          <>
            <span className="px-1 font-medium text-sky-400">
              {selectedCount} selected
            </span>
            {isSingleSelected && (
              <button
                type="button"
                onClick={onRenameSelected}
                className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-200 hover:border-neutral-500"
              >
                Rename
              </button>
            )}
            <button
              type="button"
              onClick={onCopySelected}
              className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-200 hover:border-neutral-500"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={onMoveSelected}
              className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-200 hover:border-neutral-500"
            >
              Cut
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="rounded border border-rose-700/70 bg-rose-950/60 px-2 py-1 font-medium text-rose-200 hover:bg-rose-900"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
