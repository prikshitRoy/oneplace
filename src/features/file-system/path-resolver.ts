// Pure functions for normalizing paths, resolving parent folders, and building breadcrumbs.

import {
  CURRENT_DIRECTORY_TOKEN,
  HIDDEN_FILE_PREFIX,
  PARENT_DIRECTORY_TOKEN,
  ROOT_LABELS,
  VIRTUAL_PATH_SEPARATOR,
} from "./constants";
import type { BreadcrumbSegment, RootLocationId, VirtualPath } from "./types";

/** Normalizes Windows and Unix slashes and resolves "." and ".." segments safely inside a root. */
export function normalizeRelativePath(rawPath: string): string {
  // Replace Windows backslashes with canonical forward slashes before splitting
  const unifiedSlashes = rawPath.replace(/\\/g, VIRTUAL_PATH_SEPARATOR);
  const rawSegments = unifiedSlashes.split(VIRTUAL_PATH_SEPARATOR);
  const resolvedSegments: string[] = [];

  for (const segment of rawSegments) {
    const trimmed = segment.trim();
    if (!trimmed || trimmed === CURRENT_DIRECTORY_TOKEN) {
      continue;
    }
    if (trimmed === PARENT_DIRECTORY_TOKEN) {
      // Pop the last segment if present, preventing escape above the storage root
      resolvedSegments.pop();
      continue;
    }
    resolvedSegments.push(trimmed);
  }

  return resolvedSegments.join(VIRTUAL_PATH_SEPARATOR);
}

/** Creates a normalized VirtualPath for a given root and relative path string. */
export function createVirtualPath(
  rootId: RootLocationId,
  relativePath = "",
  mountPrefix?: string
): VirtualPath {
  const normalized = normalizeRelativePath(relativePath);
  if (mountPrefix) {
    return { rootId, relativePath: normalized, mountPrefix };
  }
  return { rootId, relativePath: normalized };
}

/** Appends a child folder or file name to an existing VirtualPath. */
export function joinVirtualPath(basePath: VirtualPath, childSegment: string): VirtualPath {
  const combined = basePath.relativePath
    ? `${basePath.relativePath}${VIRTUAL_PATH_SEPARATOR}${childSegment}`
    : childSegment;

  return createVirtualPath(basePath.rootId, combined, basePath.mountPrefix);
}

/** Returns the parent VirtualPath, or null if the path is already at the root boundary. */
export function getParentVirtualPath(currentPath: VirtualPath): VirtualPath | null {
  if (!currentPath.relativePath) {
    return null;
  }

  const segments = currentPath.relativePath.split(VIRTUAL_PATH_SEPARATOR);
  segments.pop();

  return createVirtualPath(
    currentPath.rootId,
    segments.join(VIRTUAL_PATH_SEPARATOR),
    currentPath.mountPrefix
  );
}

/** Converts a VirtualPath into clickable breadcrumb segments starting from the storage root. */
export function getBreadcrumbSegments(currentPath: VirtualPath): BreadcrumbSegment[] {
  const rootLabel = currentPath.mountPrefix || ROOT_LABELS[currentPath.rootId];
  const segments: BreadcrumbSegment[] = [
    {
      label: rootLabel,
      targetPath: createVirtualPath(currentPath.rootId, "", currentPath.mountPrefix),
    },
  ];

  if (!currentPath.relativePath) {
    return segments;
  }

  const parts = currentPath.relativePath.split(VIRTUAL_PATH_SEPARATOR);
  let accumulatedPath = "";

  for (const part of parts) {
    accumulatedPath = accumulatedPath
      ? `${accumulatedPath}${VIRTUAL_PATH_SEPARATOR}${part}`
      : part;

    segments.push({
      label: part,
      targetPath: createVirtualPath(
        currentPath.rootId,
        accumulatedPath,
        currentPath.mountPrefix
      ),
    });
  }

  return segments;
}

/** Checks whether two VirtualPath objects point to the exact same location. */
export function isSameVirtualPath(first: VirtualPath, second: VirtualPath): boolean {
  return (
    first.rootId === second.rootId &&
    first.relativePath === second.relativePath &&
    (first.mountPrefix ?? "") === (second.mountPrefix ?? "")
  );
}

/** Extracts the lowercase file extension without a dot, returning an empty string for folders or dot-only names. */
export function extractFileExtension(entryName: string, isDirectory: boolean): string {
  if (isDirectory) {
    return "";
  }
  const lastDotIndex = entryName.lastIndexOf(".");
  // Ignore leading dots (e.g., ".gitignore") or trailing dots
  if (lastDotIndex <= 0 || lastDotIndex === entryName.length - 1) {
    return "";
  }
  return entryName.slice(lastDotIndex + 1).toLowerCase();
}

/** Returns true when a file or folder name starts with a dot (e.g., ".git", ".env"). */
export function isHiddenEntryName(entryName: string): boolean {
  return entryName.trim().startsWith(HIDDEN_FILE_PREFIX);
}


/** Converts desktop paths and Android SAF tree URIs into normalized POSIX mount paths. */
export function normalizePickedDirectoryPath(rawSelectedPath: string): string {
  const trimmed = rawSelectedPath.trim();
  if (!trimmed) {
    return "";
  }

  // Decode Android Storage Access Framework (SAF) tree URIs
  if (trimmed.startsWith("content://")) {
    const decoded = decodeURIComponent(trimmed);
    const rawMatch = decoded.match(/\/tree\/raw:(.+)$/);
    if (rawMatch?.[1]) {
      return rawMatch[1].replace(/\\/g, VIRTUAL_PATH_SEPARATOR).replace(/\/+$/, "");
    }

    const primaryMatch = decoded.match(/\/tree\/primary:(.*)$/);
    if (primaryMatch) {
      const subPath = normalizeRelativePath(primaryMatch[1] ?? "");
      return subPath ? `/storage/emulated/0/${subPath}` : "/storage/emulated/0";
    }
  }

  return trimmed.replace(/\\/g, VIRTUAL_PATH_SEPARATOR).replace(/\/+$/, "");
}
