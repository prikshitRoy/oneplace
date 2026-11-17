// Pure formatting functions for file sizes, modification timestamps, and type badges.

import type { FileEntry } from "@/features/file-system";
import type { EntryVisualCategory } from "./types";

/** Binary kilobyte divisor used to scale byte counts into human-readable units. */
const BYTES_PER_KILOBYTE = 1024;

/** Ordered byte size unit labels from bytes up to terabytes. */
const SIZE_UNIT_LABELS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Length of the "YYYY-MM-DDTHH:mm" prefix in an ISO-8601 timestamp string. */
const ISO_MINUTE_SLICE_LENGTH = 16;

/**Placeholder string shown when a directory size or missing date is rendered. */
export const EMPTY_METADATA_PLACEHOLDER = "—";

/** Formats a byte count into a human-readable string (e.g., "1.5 MB"). */
export function formatFileSize(sizeBytes: number, isDirectory = false): string {
  if (isDirectory || sizeBytes < 0) {
    return EMPTY_METADATA_PLACEHOLDER;
  }
  if (sizeBytes === 0) {
    return "0 B";
  }

  const unitIndex = Math.min(
    Math.floor(Math.log(sizeBytes) / Math.log(BYTES_PER_KILOBYTE)),
    SIZE_UNIT_LABELS.length - 1
  );
  const scaledValue = sizeBytes / Math.pow(BYTES_PER_KILOBYTE, unitIndex);
  const rounded = unitIndex === 0 ? scaledValue.toString() : scaledValue.toFixed(1);

  return `${rounded.replace(/\.0$/, "")} ${SIZE_UNIT_LABELS[unitIndex]}`;
}

/** Formats an epoch millisecond timestamp into a deterministic "YYYY-MM-DD HH:mm" string. */
export function formatModifiedDate(modifiedAtMs: number | null): string {
  if (modifiedAtMs === null || modifiedAtMs <= 0 || Number.isNaN(modifiedAtMs)) {
    return EMPTY_METADATA_PLACEHOLDER;
  }

  return new Date(modifiedAtMs)
    .toISOString()
    .slice(0, ISO_MINUTE_SLICE_LENGTH)
    .replace("T", " ");
}

/** Returns a short uppercase badge label representing the entry kind or file extension. */
export function getEntryTypeBadge(entry: FileEntry): string {
  if (entry.kind === "directory") {
    return "DIR";
  }
  if (entry.kind === "symlink") {
    return "LINK";
  }
  if (!entry.extension) {
    return "FILE";
  }
  return entry.extension.slice(0, 4).toUpperCase();
}


/** Extracts a concise folder or drive display name from a custom mount prefix. */
export function formatCustomMountLabel(mountPrefix: string | undefined): string {
  if (!mountPrefix) {
    return "Custom Folder";
  }

  const normalized = mountPrefix.replace(/\\/g, "/").replace(/\/+$/, "");
  if (!normalized) {
    return "/";
  }

  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? normalized;
}



const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mkv", "webm", "mov", "avi", "m4v"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "flac", "ogg", "m4a", "aac"]);
const ARCHIVE_EXTENSIONS = new Set(["zip", "tar", "gz", "7z", "rar", "bz2", "xz"]);
const CODE_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx", "rs", "py", "json", "toml", "yaml", "yml", "html", "css", "sh", "sql"]);
const DOCUMENT_EXTENSIONS = new Set(["pdf", "md", "txt", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv"]);

/** Classifies a FileEntry into a visual category for icon and color rendering. */
export function getEntryVisualCategory(entry: FileEntry): EntryVisualCategory {
  if (entry.kind === "directory") {
    return "folder";
  }
  if (entry.kind === "symlink") {
    return "symlink";
  }

  const ext = entry.extension.toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (ARCHIVE_EXTENSIONS.has(ext)) return "archive";
  if (CODE_EXTENSIONS.has(ext)) return "code";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";

  return "generic";
}