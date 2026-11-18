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
import { type as getOsType } from "@tauri-apps/plugin-os";
import type { RootLocationId, VirtualPath } from "./types";

/** Resolved path and optional Tauri BaseDirectory ready for @tauri-apps/plugin-fs calls. */
export interface TauriFsTarget {
  readonly targetPath: string;
  readonly baseDir?: BaseDirectory;
}

/** Lookup table mapping logical root IDs to Tauri BaseDirectory enum values on desktop/iOS. */
const ROOT_TO_BASE_DIR: Partial<Record<RootLocationId, BaseDirectory>> = {
  documents: BaseDirectory.Document,
  downloads: BaseDirectory.Download,
  pictures: BaseDirectory.Picture,
  videos: BaseDirectory.Video,
  audio: BaseDirectory.Audio,
  appData: BaseDirectory.AppLocalData,
  home: BaseDirectory.Home,
};

/** Shared external storage directories on Android devices. */
const ANDROID_SHARED_ROOT_PATHS: Partial<Record<RootLocationId, string>> = {
  documents: "/storage/emulated/0/Documents",
  downloads: "/storage/emulated/0/Download",
  pictures: "/storage/emulated/0/Pictures",
  videos: "/storage/emulated/0/Movies",
  audio: "/storage/emulated/0/Music",
  home: "/storage/emulated/0",
};

/** Safely checks whether the current runtime is Android. */
function isAndroidRuntime(): boolean {
  try {
    return getOsType() === "android";
  } catch {
    return false;
  }
}

/** Converts a VirtualPath into a path string and BaseDirectory for plugin-fs. */
export function resolveTauriFsTarget(virtualPath: VirtualPath): TauriFsTarget {
  if (virtualPath.rootId === "customDrive") {
    const prefix = (virtualPath.mountPrefix ?? "")
      .replace(/\\/g, "/")
      .replace(/\/+$/, "");
    if (virtualPath.relativePath) {
      return { targetPath: `${prefix}/${virtualPath.relativePath}` };
    }
    const isWindowsDriveRoot = /^[A-Za-z]:$/.test(prefix);
    return { targetPath: isWindowsDriveRoot ? `${prefix}/` : prefix || "/" };
  }

  // On Android, point public media/document tabs to shared phone storage instead of the empty app sandbox
  if (isAndroidRuntime() && virtualPath.rootId !== "appData") {
    const sharedRoot = ANDROID_SHARED_ROOT_PATHS[virtualPath.rootId];
    if (sharedRoot) {
      const targetPath = virtualPath.relativePath
        ? `${sharedRoot}/${virtualPath.relativePath}`
        : sharedRoot;
      return { targetPath };
    }
  }

  const baseDir = ROOT_TO_BASE_DIR[virtualPath.rootId] ?? BaseDirectory.Document;
  return {
    targetPath: virtualPath.relativePath || ".",
    baseDir,
  };
}

/** Resolves the native OS base directory path for a given logical root ID via Tauri IPC. */
async function resolveNativeRootDir(virtualPath: VirtualPath): Promise<string> {
  if (isAndroidRuntime() && virtualPath.rootId !== "appData") {
    const sharedRoot = ANDROID_SHARED_ROOT_PATHS[virtualPath.rootId];
    if (sharedRoot) {
      return sharedRoot;
    }
  }

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
