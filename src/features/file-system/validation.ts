// Pure input validation for file and folder names at the user/OS boundary.

import { CURRENT_DIRECTORY_TOKEN, PARENT_DIRECTORY_TOKEN } from "./constants";

/** Characters forbidden in file or folder names on Windows, Android, and Unix systems. */
const FORBIDDEN_FILENAME_CHARS_REGEX = /[<>:"/\\|?*\x00-\x1F]/;

/** Windows reserved device names that cannot be used as file or folder names. */
const WINDOWS_RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

/** Result of validating a candidate file or directory name. */
export interface NameValidationResult {
  readonly isValid: boolean;
  readonly sanitizedName: string;
  readonly errorMessage: string | null;
}

/** Validates a proposed file or directory name for cross-platform safety. */
export function validateEntryName(rawName: string): NameValidationResult {
  const trimmed = rawName.trim();

  if (!trimmed) {
    return {
      isValid: false,
      sanitizedName: "",
      errorMessage: "Name cannot be empty.",
    };
  }

  if (trimmed === CURRENT_DIRECTORY_TOKEN || trimmed === PARENT_DIRECTORY_TOKEN) {
    return {
      isValid: false,
      sanitizedName: trimmed,
      errorMessage: "Name cannot be '.' or '..'.",
    };
  }

  if (FORBIDDEN_FILENAME_CHARS_REGEX.test(trimmed)) {
    return {
      isValid: false,
      sanitizedName: trimmed,
      errorMessage: 'Name cannot contain slashes or special characters (< > : " | ? *).',
    };
  }

  const baseWithoutExt = trimmed.split(".")[0].toUpperCase();
  if (WINDOWS_RESERVED_NAMES.has(baseWithoutExt)) {
    return {
      isValid: false,
      sanitizedName: trimmed,
      errorMessage: `"${trimmed}" is a reserved system name.`,
    };
  }

  return {
    isValid: true,
    sanitizedName: trimmed,
    errorMessage: null,
  };
}
