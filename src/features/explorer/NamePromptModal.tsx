// Theme-aware modal dialog for entering and validating folder or file names.

import { useState, type FormEvent } from "react";
import { validateEntryName } from "@/features/file-system";
import type { ActivePromptModal } from "./types";

export interface NamePromptModalProps {
  readonly modal: ActivePromptModal;
  readonly onConfirm: (sanitizedName: string) => Promise<void>;
  readonly onCancel: () => void;
}

/** Renders an accessible Light/Dark theme-aware name input dialog with validation. */
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-prompt-modal-title"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !isSubmitting) {
          onCancel();
        }
      }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 text-foreground shadow-2xl">
        <h2 id="name-prompt-modal-title" className="text-base font-semibold">
          {modal.title}
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Enter a valid name without slashes or reserved symbols.
        </p>

        <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              setValidationError(null);
            }}
            placeholder="Enter name..."
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted focus:border-sky-500 focus:outline-none"
          />

          {validationError && (
            <p role="alert" className="text-xs font-medium text-rose-500">
              {validationError}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="rounded-xl border border-border bg-elevated px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-sky-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
