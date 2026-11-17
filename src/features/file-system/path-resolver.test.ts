// Unit tests for cross-platform virtual path normalization and helper functions.

import { describe, expect, it } from "vitest";
import {
  createVirtualPath,
  extractFileExtension,
  getBreadcrumbSegments,
  getParentVirtualPath,
  isHiddenEntryName,
  joinVirtualPath,
  normalizeRelativePath,
} from "./path-resolver";

describe("normalizeRelativePath", () => {
  it("converts Windows backslashes and trims duplicate or outer slashes", () => {
    // Arrange
    const rawWindowsPath = "\\Projects\\\\one_place\\src\\";

    // Act
    const normalized = normalizeRelativePath(rawWindowsPath);

    // Assert
    expect(normalized).toBe("Projects/one_place/src");
  });

  it("prevents parent traversal tokens from escaping above the storage root", () => {
    // Arrange
    const escapingPath = "folder/../../../secret/file.txt";

    // Act
    const normalized = normalizeRelativePath(escapingPath);

    // Assert
    expect(normalized).toBe("secret/file.txt");
  });
});

describe("joinVirtualPath and getParentVirtualPath", () => {
  it("appends a child directory to a root VirtualPath", () => {
    // Arrange
    const rootPath = createVirtualPath("documents", "");

    // Act
    const childPath = joinVirtualPath(rootPath, "Work\\Invoices");

    // Assert
    expect(childPath).toEqual({
      rootId: "documents",
      relativePath: "Work/Invoices",
    });
  });

  it("returns null when requesting the parent of a top-level storage root", () => {
    // Arrange
    const rootPath = createVirtualPath("downloads", "");

    // Act
    const parentPath = getParentVirtualPath(rootPath);

    // Assert
    expect(parentPath).toBeNull();
  });

  it("returns the immediate parent VirtualPath for a nested path", () => {
    // Arrange
    const nestedPath = createVirtualPath("pictures", "2026/Vacation/Beach");

    // Act
    const parentPath = getParentVirtualPath(nestedPath);

    // Assert
    expect(parentPath).toEqual({
      rootId: "pictures",
      relativePath: "2026/Vacation",
    });
  });
});

describe("getBreadcrumbSegments", () => {
  it("builds clickable segments from the root down to the active folder", () => {
    // Arrange
    const currentPath = createVirtualPath("documents", "Code/Rust");

    // Act
    const breadcrumbs = getBreadcrumbSegments(currentPath);

    // Assert
    expect(breadcrumbs).toEqual([
      {
        label: "Documents",
        targetPath: { rootId: "documents", relativePath: "" },
      },
      {
        label: "Code",
        targetPath: { rootId: "documents", relativePath: "Code" },
      },
      {
        label: "Rust",
        targetPath: { rootId: "documents", relativePath: "Code/Rust" },
      },
    ]);
  });
});

describe("extractFileExtension and isHiddenEntryName", () => {
  it("extracts lowercase extension for standard files and ignores dotfiles or folders", () => {
    // Arrange & Act
    const pdfExt = extractFileExtension("Report.Final.PDF", false);
    const dotfileExt = extractFileExtension(".gitignore", false);
    const dirExt = extractFileExtension("archive.zip", true);

    // Assert
    expect(pdfExt).toBe("pdf");
    expect(dotfileExt).toBe("");
    expect(dirExt).toBe("");
  });

  it("identifies dot-prefixed names as hidden", () => {
    // Arrange & Act
    const hiddenResult = isHiddenEntryName(".env.local");
    const visibleResult = isHiddenEntryName("README.md");

    // Assert
    expect(hiddenResult).toBe(true);
    expect(visibleResult).toBe(false);
  });
});
