// In-memory fake Tauri file system and OS plugin harness for UI integration tests.

import { BaseDirectory } from "@tauri-apps/api/path";

/** Represents a single seeded or created entry in the in-memory fake file system. */
export interface FakeFsNode {
  baseDir?: BaseDirectory;
  parentPath: string;
  name: string;
  isDirectory: boolean;
  sizeBytes: number;
  mtimeMs: number;
}

interface FakeFsState {
  osType: "windows" | "linux" | "macos" | "android" | "ios";
  pickedFolder: string | null;
  openedPaths: string[];
  nodes: FakeFsNode[];
}

const DEFAULT_MTIME_MS = Date.UTC(2026, 10, 17, 12, 0, 0);

const state: FakeFsState = {
  osType: "windows",
  pickedFolder: null,
  openedPaths: [],
  nodes: [],
};

/** Normalizes a plugin-fs target path (converting "." to "" and trimming outer slashes). */
function normalizeTarget(rawPath: string): string {
  const unified = rawPath.replace(/\\/g, "/").replace(/\/+$/, "");
  return unified === "." ? "" : unified.replace(/^\/+/, "");
}

/** Splits a normalized target path into its parent folder path and base entry name. */
function splitParentAndName(targetPath: string): { parentPath: string; name: string } {
  const normalized = normalizeTarget(targetPath);
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash === -1) {
    return { parentPath: "", name: normalized };
  }
  return {
    parentPath: normalized.slice(0, lastSlash),
    name: normalized.slice(lastSlash + 1),
  };
}

/** Resets and seeds the in-memory fake file system before a test runs. */
export function resetFakeFileSystem(
  seedNodes: readonly FakeFsNode[] = [],
  osType: FakeFsState["osType"] = "windows"
): void {
  state.osType = osType;
  state.pickedFolder = null;
  state.openedPaths = [];
  state.nodes = seedNodes.map((node) => ({ ...node }));
}

/** Configures the folder path returned by the next fakeOpenDialog() call. */
export function setFakePickedFolder(folderPath: string | null): void {
  state.pickedFolder = folderPath;
}

/** Returns the list of native paths opened via the fake system opener plugin. */
export function getOpenedSystemPaths(): readonly string[] {
  return state.openedPaths;
}

/** Fake implementation of @tauri-apps/plugin-fs readDir. */
export async function fakeReadDir(
  targetPath: string,
  options?: { baseDir?: BaseDirectory }
) {
  const parentPath = normalizeTarget(targetPath);
  return state.nodes
    .filter(
      (node) =>
        node.baseDir === options?.baseDir && node.parentPath === parentPath
    )
    .map((node) => ({
      name: node.name,
      isDirectory: node.isDirectory,
      isFile: !node.isDirectory,
      isSymlink: false,
    }));
}

/** Fake implementation of @tauri-apps/plugin-fs stat. */
export async function fakeStat(
  targetPath: string,
  options?: { baseDir?: BaseDirectory }
) {
  const { parentPath, name } = splitParentAndName(targetPath);
  const found = state.nodes.find(
    (node) =>
      node.baseDir === options?.baseDir &&
      node.parentPath === parentPath &&
      node.name === name
  );
  return {
    size: found?.sizeBytes ?? 0,
    mtime: new Date(found?.mtimeMs ?? DEFAULT_MTIME_MS),
  };
}

/** Fake implementation of @tauri-apps/plugin-fs mkdir. */
export async function fakeMkdir(
  targetPath: string,
  options?: { baseDir?: BaseDirectory }
): Promise<void> {
  const { parentPath, name } = splitParentAndName(targetPath);
  state.nodes.push({
    baseDir: options?.baseDir,
    parentPath,
    name,
    isDirectory: true,
    sizeBytes: 0,
    mtimeMs: DEFAULT_MTIME_MS,
  });
}

/** Fake implementation of @tauri-apps/plugin-fs writeTextFile. */
export async function fakeWriteTextFile(
  targetPath: string,
  content: string,
  options?: { baseDir?: BaseDirectory }
): Promise<void> {
  const { parentPath, name } = splitParentAndName(targetPath);
  state.nodes.push({
    baseDir: options?.baseDir,
    parentPath,
    name,
    isDirectory: false,
    sizeBytes: content.length,
    mtimeMs: DEFAULT_MTIME_MS,
  });
}

/** Fake implementation of @tauri-apps/plugin-fs rename. */
export async function fakeRename(
  oldPath: string,
  newPath: string,
  options?: { oldPathBaseDir?: BaseDirectory; newPathBaseDir?: BaseDirectory }
): Promise<void> {
  const source = splitParentAndName(oldPath);
  const dest = splitParentAndName(newPath);
  const found = state.nodes.find(
    (node) =>
      node.baseDir === options?.oldPathBaseDir &&
      node.parentPath === source.parentPath &&
      node.name === source.name
  );
  if (found) {
    found.baseDir = options?.newPathBaseDir;
    found.parentPath = dest.parentPath;
    found.name = dest.name;
  }
}

/** Fake implementation of @tauri-apps/plugin-fs remove. */
export async function fakeRemove(
  targetPath: string,
  options?: { baseDir?: BaseDirectory }
): Promise<void> {
  const normalized = normalizeTarget(targetPath);
  const { parentPath, name } = splitParentAndName(targetPath);
  state.nodes = state.nodes.filter((node) => {
    if (node.baseDir !== options?.baseDir) return true;
    if (node.parentPath === parentPath && node.name === name) return false;
    if (node.parentPath === normalized || node.parentPath.startsWith(`${normalized}/`)) {
      return false;
    }
    return true;
  });
}

/** Fake implementation of @tauri-apps/plugin-fs copyFile. */
export async function fakeCopyFile(
  fromPath: string,
  toPath: string,
  options?: { fromPathBaseDir?: BaseDirectory; toPathBaseDir?: BaseDirectory }
): Promise<void> {
  const source = splitParentAndName(fromPath);
  const dest = splitParentAndName(toPath);
  const original = state.nodes.find(
    (node) =>
      node.baseDir === options?.fromPathBaseDir &&
      node.parentPath === source.parentPath &&
      node.name === source.name
  );
  state.nodes.push({
    baseDir: options?.toPathBaseDir,
    parentPath: dest.parentPath,
    name: dest.name,
    isDirectory: false,
    sizeBytes: original?.sizeBytes ?? 0,
    mtimeMs: DEFAULT_MTIME_MS,
  });
}

/** Fake implementation of @tauri-apps/plugin-os type(). */
export function fakeGetOsType() {
  return state.osType;
}

/** Fake implementation of @tauri-apps/plugin-dialog open(). */
export async function fakeOpenDialog() {
  return state.pickedFolder;
}

/** Fake implementation of @tauri-apps/plugin-opener openPath(). */
export async function fakeOpenPath(nativePath: string): Promise<void> {
  state.openedPaths.push(nativePath);
}
