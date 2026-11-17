// Crisp vector SVG icons for toolbar navigation, breadcrumbs, search, sort, and view modes.

import type { IconProps } from "./ExplorerIcons";

/** Left arrow icon for navigating backward in history. */
export function ArrowLeftIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}

/** Right arrow icon for navigating forward in history. */
export function ArrowRightIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Upward arrow icon for navigating to the parent directory. */
export function ArrowUpIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m18 15-6-6-6 6" />
    </svg>
  );
}

/** Circular arrow icon for refreshing the active directory. */
export function RefreshIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v6h-6" />
    </svg>
  );
}

/** Subtle separator chevron between breadcrumb path segments. */
export function ChevronRightIcon({ className = "h-3.5 w-3.5 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Magnifying glass icon for the folder search input. */
export function SearchIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Eye icon indicating whether hidden dotfiles are shown or concealed. */
export function EyeIcon({
  isVisible,
  className = "h-4 w-4 shrink-0",
}: {
  readonly isVisible: boolean;
  readonly className?: string;
}) {
  if (isVisible) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m2 2 20 20" />
    </svg>
  );
}

/** 2x2 grid icon for the Grid View switcher button. */
export function GridViewIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/** Horizontal rows icon for the List View switcher button. */
export function ListViewIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
