// Maps platform-agnostic VirtualPaths to Tauri BaseDirectory options and native OS paths.

import {
  appLocalDataDir,
  audioDir,
   BaseDirectory,
  documentDir,
  downloadDir,
  homeDir,
  join,
  pictureDir,
  videoDir,
} from "@tauri-apps/api/path";
import type { RootLocationId, VirtualPath } from "./types";

/** Resolved path and optional Tauri BaseDirectory ready for @tauri-apps/plugin-fs calls. */
export interface TauriFsTarget {
  readonly targetPath: string;
  readonly baseDir?: BaseDirectory;
}

/** Lookup table mapping logical root IDs to Tauri BaseDirectory enum values. */
const ROOT_TO_BASE_DIR: Partial<Record<RootLocationId, BaseDirectory>> = {
  documents: BaseDirectory.Document,
  downloads: BaseDirectory.Download,
  pictures: BaseDirectory.Picture,
  videos: BaseDirectory.Video,
  audio: BaseDirectory.Audio,
  appData: BaseDirectory.AppLocalData,
  home: BaseDirectory.Home,
};

/** Pure helper that converts a VirtualPath into a path string and BaseDirectory for plugin-fs. */
export function resolveTauriFsTarget(virtualPath: VirtualPath): TauriFsTarget {
  if (virtualPath.rootId === "customDrive") {
    const prefix = (virtualPath.mountPrefix ?? "").replace(/\/+$/, "");
    const combined = virtualPath.relativePath
      ? `${prefix}/${virtualPath.relativePath}`
      : `${prefix}/`;
    return { targetPath: combined };
  }

  const baseDir = ROOT_TO_BASE_DIR[virtualPath.rootId] ?? BaseDirectory.Document;
  return {
    targetPath: virtualPath.relativePath || ".",
    baseDir,
  };
}

/** Resolves the native OS base directory path for a given logical root ID via Tauri IPC. */
async function resolveNativeRootDir(virtualPath: VirtualPath): Promise<string> {
  switch (virtualPath.rootId) {
    case "documents":
      return documentDir();
    case "downloads":
      return downloadDir();
    case "pictures":
      return pictureDir();
    case "videos":
      return videoDir();
    case "audio":
      return audioDir();
    case "appData":
      return appLocalDataDir();
    case "home":
      return homeDir();
    case "customDrive":
      return virtualPath.mountPrefix ?? "";
  }
}

/** Resolves a VirtualPath into a full native OS path string for system file openers. */
export async function resolveNativeSystemPath(virtualPath: VirtualPath): Promise<string> {
  const rootDir = await resolveNativeRootDir(virtualPath);
  if (!virtualPath.relativePath) {
    return rootDir;
  }
  return join(rootDir, virtualPath.relativePath);
}
