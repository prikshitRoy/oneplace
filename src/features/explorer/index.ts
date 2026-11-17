// Public API for the explorer UI feature module.

export type {
  ActivePromptModal,
  EntryVisualCategory,
  ExplorerViewMode,
  PromptModalKind,
} from "./types";

export {
  EMPTY_METADATA_PLACEHOLDER,
  formatCustomMountLabel,
  formatFileSize,
  formatModifiedDate,
  getEntryTypeBadge,
  getEntryVisualCategory,
} from "./formatters";

export { ExplorerShell } from "./ExplorerShell";
