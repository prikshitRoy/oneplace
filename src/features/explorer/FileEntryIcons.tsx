// Color-coded vector icons for folders, files, and selection checkboxes.

import type { EntryVisualCategory } from "./types";

export interface EntryVisualIconProps {
  readonly category: EntryVisualCategory;
  readonly size?: "sm" | "lg";
}

/** Color palette mapping each EntryVisualCategory to container and icon classes. */
const CATEGORY_STYLES: Readonly<Record<EntryVisualCategory, string>> = {
  folder: "bg-amber-500/15 text-amber-500",
  symlink: "bg-cyan-500/15 text-cyan-500",
  image: "bg-emerald-500/15 text-emerald-500",
  video: "bg-purple-500/15 text-purple-500",
  audio: "bg-pink-500/15 text-pink-500",
  archive: "bg-orange-500/15 text-orange-500",
  code: "bg-sky-500/15 text-sky-500",
  document: "bg-blue-500/15 text-blue-500",
  generic: "bg-neutral-500/15 text-muted",
};

/** Renders a stylized icon badge for a folder or file category. */
export function EntryVisualIcon({
  category,
  size = "lg",
}: EntryVisualIconProps) {
  const containerSize = size === "lg" ? "h-11 w-11 rounded-xl" : "h-8 w-8 rounded-lg";
  const svgSize = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  const colorClasses = CATEGORY_STYLES[category];

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${containerSize} ${colorClasses}`}
      aria-hidden="true"
    >
      {category === "folder" ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className={svgSize}>
          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
      ) : category === "image" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={svgSize}>
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-5-5L5 21" />
        </svg>
      ) : category === "video" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={svgSize}>
          <rect x="2" y="4" width="20" height="16" rx="2.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m10 9 5 3-5 3V9z" />
        </svg>
      ) : category === "audio" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={svgSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ) : category === "code" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={svgSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      ) : category === "archive" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={svgSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={svgSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
      )}
    </div>
  );
}

/** Checkmark badge button allowing one-click additive selection on desktop and mobile. */
export function SelectionCheckButton({
  isSelected,
  entryName,
  onToggle,
}: {
  readonly isSelected: boolean;
  readonly entryName: string;
  readonly onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Select ${entryName}`}
      aria-pressed={isSelected}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
        isSelected
          ? "border-sky-500 bg-sky-600 text-white"
          : "border-border bg-background/80 text-transparent opacity-60 hover:border-sky-500 group-hover:opacity-100"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  );
}
