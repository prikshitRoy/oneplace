// Side-effect adapter for creating, renaming, deleting, copying, moving, and opening files.

import { open as openDialog } from "@tauri-apps/plugin-dialog";
import {
  copyFile,
  mkdir,
  remove,
  rename,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { VIRTUAL_PATH_SEPARATOR } from "./constants";
import {
  createVirtualPath,
  getParentVirtualPath,
  joinVirtualPath,
  normalizePickedDirectoryPath,
} from "./path-resolver";
import { resolveNativeSystemPath, resolveTauriFsTarget } from "./tauri-target";
import type { VirtualPath } from "./types";
import { validateEntryName } from "./validation";

/** Extracts the last segment (file or folder name) from a VirtualPath. */
function getEntryBaseName(path: VirtualPath): string {
  const segments = path.relativePath.split(VIRTUAL_PATH_SEPARATOR);
  return segments[segments.length - 1] ?? "";
}

/** Creates a new directory inside parentPath after validating the folder name. */
export async function createDirectory(
  parentPath: VirtualPath,
  folderName: string
): Promise<VirtualPath> {
  const validation = validateEntryName(folderName);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage ?? "Invalid folder name.");
  }

  const newFolderPath = joinVirtualPath(parentPath, validation.sanitizedName);
  const target = resolveTauriFsTarget(newFolderPath);

  try {
    await mkdir(target.targetPath, { baseDir: target.baseDir, recursive: true });
    return newFolderPath;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not create folder "${validation.sanitizedName}": ${detail}`);
  }
}

/** Creates an empty text file inside parentPath after validating the file name. */
export async function createTextFile(
  parentPath: VirtualPath,
  fileName: string,
  initialContent = ""
): Promise<VirtualPath> {
  const validation = validateEntryName(fileName);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage ?? "Invalid file name.");
  }

  const newFilePath = joinVirtualPath(parentPath, validation.sanitizedName);
  const target = resolveTauriFsTarget(newFilePath);

  try {
    await writeTextFile(target.targetPath, initialContent, {
      baseDir: target.baseDir,
    });
    return newFilePath;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not create file "${validation.sanitizedName}": ${detail}`);
  }
}

/** Renames an existing file or folder within the same parent directory. */
export async function renameFileEntry(
  sourcePath: VirtualPath,
  newName: string
): Promise<VirtualPath> {
  const validation = validateEntryName(newName);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage ?? "Invalid new name.");
  }

  const parentPath =
    getParentVirtualPath(sourcePath) ??
    createVirtualPath(sourcePath.rootId, "", sourcePath.mountPrefix);
  const destinationPath = joinVirtualPath(parentPath, validation.sanitizedName);

  const sourceTarget = resolveTauriFsTarget(sourcePath);
  const destTarget = resolveTauriFsTarget(destinationPath);

  try {
    await rename(sourceTarget.targetPath, destTarget.targetPath, {
      oldPathBaseDir: sourceTarget.baseDir,
      newPathBaseDir: destTarget.baseDir,
    });
    return destinationPath;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not rename to "${validation.sanitizedName}": ${detail}`);
  }
}

/** Deletes one or more files or directories recursively. */
export async function deleteFileEntries(
  pathsToDelete: readonly VirtualPath[]
): Promise<void> {
  for (const path of pathsToDelete) {
    const target = resolveTauriFsTarget(path);
    try {
      await remove(target.targetPath, {
        baseDir: target.baseDir,
        recursive: true,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not delete "${path.relativePath}": ${detail}`);
    }
  }
}

/** Copies or moves a list of files into destinationDirectory. */
export async function pasteFileEntries(
  sourcePaths: readonly VirtualPath[],
  destinationDirectory: VirtualPath,
  operation: "copy" | "move"
): Promise<void> {
  for (const sourcePath of sourcePaths) {
    const baseName = getEntryBaseName(sourcePath);
    if (!baseName) {
      continue;
    }

    const destinationPath = joinVirtualPath(destinationDirectory, baseName);
    const sourceTarget = resolveTauriFsTarget(sourcePath);
    const destTarget = resolveTauriFsTarget(destinationPath);

    try {
      if (operation === "move") {
        await rename(sourceTarget.targetPath, destTarget.targetPath, {
          oldPathBaseDir: sourceTarget.baseDir,
          newPathBaseDir: destTarget.baseDir,
        });
      } else {
        await copyFile(sourceTarget.targetPath, destTarget.targetPath, {
          fromPathBaseDir: sourceTarget.baseDir,
          toPathBaseDir: destTarget.baseDir,
        });
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ${operation} "${baseName}": ${detail}`);
    }
  }
}

/** Opens a file or folder using the operating system's default application. */
export async function openEntryWithSystem(targetPath: VirtualPath): Promise<void> {
  try {
    const nativePath = await resolveNativeSystemPath(targetPath);
    await openPath(nativePath);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not open "${targetPath.relativePath}": ${detail}`);
  }
}

/** Opens the native OS folder picker and returns a customDrive VirtualPath if selected. */
export async function pickCustomFolder(): Promise<VirtualPath | null> {
  try {
    const selected = await openDialog({
      directory: true,
      multiple: false,
      title: "Open Folder in One Place",
    });

    if (typeof selected !== "string" || !selected.trim()) {
      return null;
    }

    const normalizedMount = normalizePickedDirectoryPath(selected);
    return createVirtualPath("customDrive", "", normalizedMount);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not open folder picker: ${detail}`);
  }
}
