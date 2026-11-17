// Shared data contracts for cross-platform storage roots, virtual paths, and file entries.

/** Logical base directories supported across Desktop, Android, and iOS. */
export type RootLocationId =
  | "documents"
  | "downloads"
  | "pictures"
  | "videos"
  | "audio"
  | "appData"
  | "home"
  | "customDrive";

/** Normalized, OS-agnostic location inside a storage root. */
export interface VirtualPath {
  /** Logical identifier of the storage root. */
  readonly rootId: RootLocationId;
  /** Forward-slash separated relative path inside the root (never starts or ends with "/"). */
  readonly relativePath: string;
  /** Optional native mount prefix when rootId is "customDrive" (e.g., "C:" or "/mnt/usb"). */
  readonly mountPrefix?: string;
}

/** Classification of a file system entry. */
export type FileKind = "directory" | "file" | "symlink";

/** Platform-agnostic metadata for a single file or directory. */
export interface FileEntry {
  /** Base name of the file or folder (e.g., "report.pdf"). */
  readonly name: string;
  /** Lowercase file extension without the leading dot (empty string for directories). */
  readonly extension: string;
  /** Normalized virtual path pointing to this entry. */
  readonly path: VirtualPath;
  /** Entry classification. */
  readonly kind: FileKind;
  /** Size in bytes (0 for directories). */
  readonly sizeBytes: number;
  /** Last modified timestamp in epoch milliseconds, or null if unavailable. */
  readonly modifiedAtMs: number | null;
  /** True when the entry starts with "." or is marked hidden by the OS. */
  readonly isHidden: boolean;
}

/** Top-level storage location displayed in the sidebar or mobile bottom bar. */
export interface StorageRoot {
  /** Unique identifier for this root. */
  readonly id: RootLocationId;
  /** Human-readable display label (e.g., "Documents"). */
  readonly label: string;
  /** Default starting virtual path when selecting this root. */
  readonly rootPath: VirtualPath;
  /** True if this root is safe and available inside mobile sandboxes. */
  readonly isAvailableOnMobile: boolean;
}

/** Represents a clickable segment in the explorer breadcrumb bar. */
export interface BreadcrumbSegment {
  /** Display name for this segment. */
  readonly label: string;
  /** Target virtual path when the user clicks this breadcrumb. */
  readonly targetPath: VirtualPath;
}
