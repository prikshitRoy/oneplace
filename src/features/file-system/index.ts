// Public API for the file-system feature module.

export type {
  BreadcrumbSegment,
  FileEntry,
  FileKind,
  RootLocationId,
  StorageRoot,
  SystemDrive,
  VirtualPath,
} from "./types";

export {
   DEFAULT_STORAGE_ROOTS,
  ROOT_LABELS,
  VIRTUAL_PATH_SEPARATOR,
} from "./constants";

export {
  createVirtualPath,
  extractFileExtension,
  getBreadcrumbSegments,
  getParentVirtualPath,
  isHiddenEntryName,
  isSameVirtualPath,
  joinVirtualPath,
  normalizePickedDirectoryPath,
  normalizeRelativePath,
} from "./path-resolver";

export type { NameValidationResult } from "./validation";
export { validateEntryName } from "./validation";

export type { TauriFsTarget } from "./tauri-target";
export { resolveNativeSystemPath, resolveTauriFsTarget } from "./tauri-target";

export {
  formatSystemDriveLabel,
  formatWindowsDriveLabel,
  getAvailableStorageRoots,
  getAvailableSystemDrives,
  listDirectoryEntries,
} from "./directory-reader";

export {
  createDirectory,
  createTextFile,
  deleteFileEntries,
  openEntryWithSystem,
  pasteFileEntries,
  pickCustomFolder,
  renameFileEntry,
} from "./file-operations";
