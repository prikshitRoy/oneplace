// Side-effect adapter for listing directory entries and detecting platform storage roots.

import { invoke } from "@tauri-apps/api/core";
import { mkdir, readDir, stat, type DirEntry } from "@tauri-apps/plugin-fs";
import { type as getOsType } from "@tauri-apps/plugin-os";
import { DEFAULT_STORAGE_ROOTS } from "./constants";
import {
  createVirtualPath,
  extractFileExtension,
  isHiddenEntryName,
  joinVirtualPath,
} from "./path-resolver";
import { resolveTauriFsTarget } from "./tauri-target";
import type {
  FileEntry,
  FileKind,
  StorageRoot,
  SystemDrive,
  VirtualPath,
} from "./types";

/** Maps Tauri's DirEntry flags to our unified FileKind type. */
function resolveFileKind(rawEntry: DirEntry): FileKind {
  if (rawEntry.isDirectory) {
    return "directory";
  }
  if (rawEntry.isSymlink) {
    return "symlink";
  }
  return "file";
}

/** Fetches size and modified timestamp for a single directory entry, falling back safely if locked. */
async function readEntryMetadata(
  entryPath: VirtualPath,
  isDirectory: boolean
): Promise<{ sizeBytes: number; modifiedAtMs: number | null }> {
  const target = resolveTauriFsTarget(entryPath);
  try {
    const info = await stat(target.targetPath, { baseDir: target.baseDir });
    return {
      sizeBytes: isDirectory ? 0 : info.size,
      modifiedAtMs: info.mtime ? info.mtime.getTime() : null,
    };
  } catch {
    // OS system files (e.g., pagefile or restricted sockets) may reject stat calls
    return { sizeBytes: 0, modifiedAtMs: null };
  }
}

/** Reads all entries inside a VirtualPath directory via Tauri's file system plugin. */
export async function listDirectoryEntries(
  directoryPath: VirtualPath
): Promise<FileEntry[]> {
  const target = resolveTauriFsTarget(directoryPath);

  try {
    let rawEntries: DirEntry[];
    try {
      rawEntries = await readDir(target.targetPath, {
        baseDir: target.baseDir,
      });
    } catch (readError) {
      // Auto-create AppLocalData root on first launch if the OS has not created it yet
      if (directoryPath.rootId === "appData" && !directoryPath.relativePath) {
        await mkdir(target.targetPath, {
          baseDir: target.baseDir,
          recursive: true,
        });
        rawEntries = [];
      } else {
        throw readError;
      }
    }

    const entries = await Promise.all(
      rawEntries.map(async (rawEntry): Promise<FileEntry> => {
        const entryVirtualPath = joinVirtualPath(directoryPath, rawEntry.name);
        const kind = resolveFileKind(rawEntry);
        const isDir = kind === "directory";
        const metadata = await readEntryMetadata(entryVirtualPath, isDir);

        return {
          name: rawEntry.name,
          extension: extractFileExtension(rawEntry.name, isDir),
          path: entryVirtualPath,
          kind,
          sizeBytes: metadata.sizeBytes,
          modifiedAtMs: metadata.modifiedAtMs,
          isHidden: isHiddenEntryName(rawEntry.name),
        };
      })
    );

    return entries;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read "${target.targetPath}". On Android, run "yarn android:grant-storage" or enable All Files Access in Settings. (${detail})`
    );
  }
}


/** Formats a Windows drive root (e.g., "C:/" or "E:\") into a sidebar label ("Drive (C:)"). */
export function formatWindowsDriveLabel(mountPath: string): string {
  const cleaned = mountPath.replace(/\\/g, "/").replace(/\/+$/, "").toUpperCase();
  const driveLetter = cleaned.endsWith(":") ? cleaned : `${cleaned}:`;
  return `Drive (${driveLetter})`;
}

/** Formats a Windows, Linux, or Android drive mount path into a concise display label. */
export function formatSystemDriveLabel(mountPath: string): string {
  const unified = mountPath.replace(/\\/g, "/").trim();
  if (unified === "/") {
    return "System Root (/)";
  }

  const trimmed = unified.replace(/\/+$/, "");
  if (trimmed === "/storage/emulated/0") {
    return "Internal Storage";
  }

  if (/^\/storage\/[^/]+$/i.test(trimmed)) {
    const volumeId = trimmed.split("/").pop() ?? trimmed;
    return `SD Card (${volumeId})`;
  }

  if (/^[A-Za-z]:$/.test(trimmed)) {
    return formatWindowsDriveLabel(trimmed);
  }

  const segments = trimmed.split("/").filter(Boolean);
  const folderName = segments[segments.length - 1] ?? trimmed;
  return `Drive (${folderName})`;
}

/** Queries mounted Windows, Linux, or Android drives/volumes via Tauri IPC. */
export async function getAvailableSystemDrives(): Promise<SystemDrive[]> {
  try {
    const osType = getOsType();
    if (
      osType !== "windows" &&
      osType !== "linux" &&
      osType !== "android"
    ) {
      return [];
    }

    const rawDriveRoots = await invoke<string[]>("list_system_drives");
    return rawDriveRoots.map((rawRoot): SystemDrive => {
      const unified = rawRoot.replace(/\\/g, "/").trim();
      const isLinuxRoot = unified === "/";
      const cleaned = isLinuxRoot ? "/" : unified.replace(/\/+$/, "");
      const isWindowsDrive = /^[A-Za-z]:$/.test(cleaned);
      const mountPath = isWindowsDrive ? `${cleaned}/` : cleaned;

      return {
        id: `system-drive-${mountPath.toLowerCase()}`,
        label: formatSystemDriveLabel(mountPath),
        mountPath,
        rootPath: createVirtualPath("customDrive", "", mountPath),
      };
    });
  } catch {
    return [];
  }
}


/** Returns the list of storage roots supported on the current OS (filtering desktop-only roots on mobile). */
export function getAvailableStorageRoots(): StorageRoot[] {
  try {
    const currentOs = getOsType();
    const isMobile = currentOs === "android" || currentOs === "ios";
    if (isMobile) {
      return DEFAULT_STORAGE_ROOTS.filter((root) => root.isAvailableOnMobile);
    }
    return [...DEFAULT_STORAGE_ROOTS];
  } catch {
    // Fallback when running in a standard browser tab outside the Tauri runtime
    return DEFAULT_STORAGE_ROOTS.filter((root) => root.isAvailableOnMobile);
  }
}
