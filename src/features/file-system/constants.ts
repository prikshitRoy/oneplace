// Named constants for cross-platform path normalization and default storage roots.

import type { RootLocationId, StorageRoot } from "./types";

/** Canonical separator used inside all VirtualPath relative paths. */
export const VIRTUAL_PATH_SEPARATOR = "/";

/** Dotfile prefix used on Linux, macOS, Android, and iOS to mark hidden entries. */
export const HIDDEN_FILE_PREFIX = ".";

/** Parent directory traversal token that must be resolved or rejected for safety. */
export const PARENT_DIRECTORY_TOKEN = "..";

/** Current directory token ignored during path normalization. */
export const CURRENT_DIRECTORY_TOKEN = ".";

/** Human-readable labels for each logical root location. */
export const ROOT_LABELS: Readonly<Record<RootLocationId, string>> = {
  documents: "Documents",
  downloads: "Downloads",
  pictures: "Pictures",
  videos: "Videos",
  audio: "Music",
  appData: "App Storage",
  home: "Home",
  customDrive: "Drive",
};

/** Default cross-platform storage roots shown across desktop and mobile. */
export const DEFAULT_STORAGE_ROOTS: readonly StorageRoot[] = [
  {
    id: "documents",
    label: ROOT_LABELS.documents,
    rootPath: { rootId: "documents", relativePath: "" },
    isAvailableOnMobile: true,
  },
  {
    id: "downloads",
    label: ROOT_LABELS.downloads,
    rootPath: { rootId: "downloads", relativePath: "" },
    isAvailableOnMobile: true,
  },
  {
    id: "pictures",
    label: ROOT_LABELS.pictures,
    rootPath: { rootId: "pictures", relativePath: "" },
    isAvailableOnMobile: true,
  },
  {
    id: "videos",
    label: ROOT_LABELS.videos,
    rootPath: { rootId: "videos", relativePath: "" },
    isAvailableOnMobile: true,
  },
  {
    id: "audio",
    label: ROOT_LABELS.audio,
    rootPath: { rootId: "audio", relativePath: "" },
    isAvailableOnMobile: true,
  },
  {
    id: "appData",
    label: ROOT_LABELS.appData,
    rootPath: { rootId: "appData", relativePath: "" },
    isAvailableOnMobile: true,
  },
  {
    id: "home",
    label: ROOT_LABELS.home,
    rootPath: { rootId: "home", relativePath: "" },
    isAvailableOnMobile: false,
  },
];
