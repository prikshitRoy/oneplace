// Unit tests for pure file size, timestamp, and entry badge formatters.

import { describe, expect, it } from "vitest";
import { createVirtualPath, type FileEntry } from "@/features/file-system";
import {
  EMPTY_METADATA_PLACEHOLDER,
  formatFileSize,
  formatModifiedDate,
  getEntryTypeBadge,
} from "./formatters";

describe("formatFileSize", () => {
  it("returns placeholder for directories and formats byte scales accurately", () => {
    // Arrange & Act
    const dirSize = formatFileSize(4096, true);
    const zeroSize = formatFileSize(0, false);
    const kbSize = formatFileSize(1536, false);
    const mbSize = formatFileSize(1048576, false);

    // Assert
    expect(dirSize).toBe(EMPTY_METADATA_PLACEHOLDER);
    expect(zeroSize).toBe("0 B");
    expect(kbSize).toBe("1.5 KB");
    expect(mbSize).toBe("1 MB");
  });
});

describe("formatModifiedDate", () => {
  it("formats epoch milliseconds into deterministic YYYY-MM-DD HH:mm strings", () => {
    // Arrange
    const epochMs = Date.UTC(2026, 10, 17, 14, 30, 0);

    // Act
    const formattedValid = formatModifiedDate(epochMs);
    const formattedNull = formatModifiedDate(null);

    // Assert
    expect(formattedValid).toBe("2026-11-17 14:30");
    expect(formattedNull).toBe(EMPTY_METADATA_PLACEHOLDER);
  });
});

describe("getEntryTypeBadge", () => {
  it("returns DIR for folders and uppercase extension for files", () => {
    // Arrange
    const folderEntry: FileEntry = {
      name: "Photos",
      extension: "",
      path: createVirtualPath("pictures", "Photos"),
      kind: "directory",
      sizeBytes: 0,
      modifiedAtMs: null,
      isHidden: false,
    };
    const fileEntry: FileEntry = {
      name: "archive.tar.gz",
      extension: "gz",
      path: createVirtualPath("downloads", "archive.tar.gz"),
      kind: "file",
      sizeBytes: 1200,
      modifiedAtMs: null,
      isHidden: false,
    };

    // Act & Assert
    expect(getEntryTypeBadge(folderEntry)).toBe("DIR");
    expect(getEntryTypeBadge(fileEntry)).toBe("GZ");
  });
});
