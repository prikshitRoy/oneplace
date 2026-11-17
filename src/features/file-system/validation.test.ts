// Unit tests for entry name validation and Tauri target descriptor resolution.

import { BaseDirectory } from "@tauri-apps/api/path";
import { describe, expect, it } from "vitest";
import { createVirtualPath } from "./path-resolver";
import { resolveTauriFsTarget } from "./tauri-target";
import { validateEntryName } from "./validation";

describe("validateEntryName", () => {
  it("accepts valid cross-platform names and trims surrounding whitespace", () => {
    // Arrange & Act
    const result = validateEntryName("  Project Notes 2026.md  ");

    // Assert
    expect(result).toEqual({
      isValid: true,
      sanitizedName: "Project Notes 2026.md",
      errorMessage: null,
    });
  });

  it("rejects empty strings and dot navigation tokens", () => {
    // Arrange & Act
    const emptyResult = validateEntryName("   ");
    const parentResult = validateEntryName("..");

    // Assert
    expect(emptyResult.isValid).toBe(false);
    expect(parentResult.isValid).toBe(false);
  });

  it("rejects names containing slashes or forbidden characters", () => {
    // Arrange & Act
    const slashResult = validateEntryName("sub/folder");
    const colonResult = validateEntryName("report:final.txt");

    // Assert
    expect(slashResult.isValid).toBe(false);
    expect(colonResult.isValid).toBe(false);
  });

  it("rejects Windows reserved device names even with extensions", () => {
    // Arrange & Act
    const conResult = validateEntryName("CON");
    const nulResult = validateEntryName("nul.txt");

    // Assert
    expect(conResult.isValid).toBe(false);
    expect(nulResult.isValid).toBe(false);
  });
});

describe("resolveTauriFsTarget", () => {
  it("maps standard logical roots to their Tauri BaseDirectory enum", () => {
    // Arrange
    const rootDocPath = createVirtualPath("documents", "");
    const nestedDownloadPath = createVirtualPath("downloads", "iso/ubuntu.iso");

    // Act
    const rootTarget = resolveTauriFsTarget(rootDocPath);
    const nestedTarget = resolveTauriFsTarget(nestedDownloadPath);

    // Assert
    expect(rootTarget).toEqual({
      targetPath: ".",
      baseDir: BaseDirectory.Document,
    });
    expect(nestedTarget).toEqual({
      targetPath: "iso/ubuntu.iso",
      baseDir: BaseDirectory.Download,
    });
  });

  it("combines mountPrefix and relativePath without a BaseDirectory for customDrive roots", () => {
    // Arrange
    const customPath = createVirtualPath("customDrive", "Projects/OnePlace", "E:/Software");

    // Act
    const target = resolveTauriFsTarget(customPath);

    // Assert
    expect(target).toEqual({
      targetPath: "E:/Software/Projects/OnePlace",
    });
  });
});
