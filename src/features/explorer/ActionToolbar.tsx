// Contextual action bar with icon buttons for creating items and acting on selections.

import type { ClipboardState } from "@/features/selection";
import {
  CheckSquareIcon,
  ClipboardPasteIcon,
  CopyIcon,
  EditPencilIcon,
  FilePlusIcon,
  ScissorsCutIcon,
  TrashDeleteIcon,
} from "./ActionIcons";
import { FolderPlusIcon } from "./ExplorerIcons";

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

/** Renders primary creation buttons and a contextual selection/clipboard bar when active. */
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
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-panel/60 px-3.5 py-2 text-xs">
      {/* Left group: Primary creation actions and selection helpers */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenCreateFolder}
          className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 font-semibold text-white shadow-sm transition-colors hover:bg-sky-500"
        >
          <FolderPlusIcon className="h-3.5 w-3.5" />
          <span>New Folder</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateFile}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-2.5 py-1.5 font-medium text-foreground transition-colors hover:border-sky-500"
        >
          <FilePlusIcon className="h-3.5 w-3.5 text-sky-500" />
          <span>New File</span>
        </button>

        <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />

        <button
          type="button"
          onClick={onToggleMultiSelectMode}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition-colors ${
            isMultiSelectMode
              ? "border-amber-500/60 bg-amber-500/15 text-amber-500"
              : "border-border bg-elevated text-muted hover:text-foreground"
          }`}
        >
          <CheckSquareIcon className="h-3.5 w-3.5" />
          <span>{isMultiSelectMode ? "Multi-Select: ON" : "Multi-Select"}</span>
        </button>

        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-lg border border-border bg-elevated px-2.5 py-1.5 font-medium text-muted transition-colors hover:text-foreground"
        >
          Select All
        </button>
      </div>

      {/* Right group: Contextual clipboard Paste button & active Selection action pill */}
      <div className="flex flex-wrap items-center gap-2">
        {clipboardState && (
          <button
            type="button"
            onClick={onPasteClipboard}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            <ClipboardPasteIcon className="h-3.5 w-3.5" />
            <span>
              Paste Here ({clipboardState.items.length}{" "}
              {clipboardState.operation === "move" ? "cut" : "copied"})
            </span>
          </button>
        )}

        {hasSelection && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-sky-500/40 bg-sky-500/10 px-2 py-1">
            <span className="px-1.5 font-semibold text-sky-500">
              {selectedCount} selected
            </span>

            {isSingleSelected && (
              <button
                type="button"
                onClick={onRenameSelected}
                className="flex items-center gap-1 rounded-lg bg-panel px-2 py-1 font-medium text-foreground shadow-sm transition-colors hover:text-sky-500"
              >
                <EditPencilIcon />
                <span>Rename</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCopySelected}
              className="flex items-center gap-1 rounded-lg bg-panel px-2 py-1 font-medium text-foreground shadow-sm transition-colors hover:text-sky-500"
            >
              <CopyIcon />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={onMoveSelected}
              className="flex items-center gap-1 rounded-lg bg-panel px-2 py-1 font-medium text-foreground shadow-sm transition-colors hover:text-sky-500"
            >
              <ScissorsCutIcon />
              <span>Cut</span>
            </button>

            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 font-medium text-white shadow-sm transition-colors hover:bg-rose-500"
            >
              <TrashDeleteIcon />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-lg px-2 py-1 font-medium text-muted transition-colors hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
