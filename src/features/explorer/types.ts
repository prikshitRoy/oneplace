// Shared UI data contracts for the adaptive explorer feature module.

import type { VirtualPath } from "@/features/file-system";

/** Layout presentation modes for directory contents. */
export type ExplorerViewMode = "grid" | "list";

/** Active modal prompt types for naming folders or files. */
export type PromptModalKind = "createFolder" | "createFile" | "rename";

/** Configuration state for the name input modal dialog. */
export interface ActivePromptModal {
  readonly kind: PromptModalKind;
  readonly title: string;
  readonly initialValue: string;
  readonly targetPath?: VirtualPath;
}


/** Visual category used to assign distinct icons and accent colors to file entries. */
export type EntryVisualCategory =
  | "folder"
  | "symlink"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "code"
  | "document"
  | "generic";