// Modal dialog for entering and validating folder or file names on desktop and mobile.

import { useState, type FormEvent } from "react";
import { validateEntryName } from "@/features/file-system";
import type { ActivePromptModal } from "./types";

export interface NamePromptModalProps {
  readonly modal: ActivePromptModal;
  readonly onConfirm: (sanitizedName: string) => Promise<void>;
  readonly onCancel: () => void;
}

/** Renders an accessible name input dialog with inline validation feedback. */
export function NamePromptModal({
  modal,
  onConfirm,
  onCancel,
}: NamePromptModalProps) {
  const [inputValue, setInputValue] = useState(modal.initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const check = validateEntryName(inputValue);
    if (!check.isValid) {
      setValidationError(check.errorMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(check.sanitizedName);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
        <h2 className="text-sm font-semibold text-white">{modal.title}</h2>

        <form onSubmit={handleFormSubmit} className="mt-3 flex flex-col gap-3">
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              setValidationError(null);
            }}
            placeholder="Enter name..."
            className="rounded border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-white focus:border-sky-500 focus:outline-none"
          />

          {validationError && (
            <p className="text-xs text-rose-400">{validationError}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
