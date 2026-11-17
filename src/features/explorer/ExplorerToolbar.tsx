// Top navigation toolbar with history controls, breadcrumbs, search, sort, and view toggles.

import type { BreadcrumbSegment, VirtualPath } from "@/features/file-system";
import type { FilterConfig, SortConfig, SortField } from "@/features/navigation";
import type { ExplorerViewMode } from "./types";

export interface ExplorerToolbarProps {
  readonly breadcrumbs: readonly BreadcrumbSegment[];
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  readonly hasParent: boolean;
  readonly filterConfig: FilterConfig;
  readonly sortConfig: SortConfig;
  readonly viewMode: ExplorerViewMode;
  readonly onNavigateBack: () => void;
  readonly onNavigateForward: () => void;
  readonly onNavigateUp: () => void;
  readonly onRefresh: () => void;
  readonly onSelectBreadcrumb: (targetPath: VirtualPath) => void;
  readonly onSearchChange: (query: string) => void;
  readonly onToggleHidden: () => void;
  readonly onSortFieldChange: (field: SortField) => void;
  readonly onToggleSortDirection: () => void;
  readonly onViewModeChange: (mode: ExplorerViewMode) => void;
}

/** Renders the top navigation, breadcrumb trail, search input, and view controls. */
export function ExplorerToolbar({
  breadcrumbs,
  canGoBack,
  canGoForward,
  hasParent,
  filterConfig,
  sortConfig,
  viewMode,
  onNavigateBack,
  onNavigateForward,
  onNavigateUp,
  onRefresh,
  onSelectBreadcrumb,
  onSearchChange,
  onToggleHidden,
  onSortFieldChange,
  onToggleSortDirection,
  onViewModeChange,
}: ExplorerToolbarProps) {
  return (
    <header className="flex flex-col gap-2 border-b border-neutral-800 bg-neutral-900/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* History & parent navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onNavigateBack}
            aria-label="Navigate back"
            className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={onNavigateForward}
            aria-label="Navigate forward"
            className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200 disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            disabled={!hasParent}
            onClick={onNavigateUp}
            aria-label="Navigate to parent folder"
            className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200 disabled:opacity-40"
          >
            Up
          </button>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh directory"
            className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200 hover:border-neutral-500"
          >
            Refresh
          </button>
        </div>

        {/* Clickable breadcrumb bar */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-1 items-center gap-1 overflow-x-auto rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-300"
        >
          {breadcrumbs.map((segment, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={`${segment.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span className="text-neutral-600">/</span>}
                <button
                  type="button"
                  onClick={() => onSelectBreadcrumb(segment.targetPath)}
                  className={`truncate rounded px-1.5 py-0.5 transition-colors ${
                    isLast
                      ? "font-semibold text-sky-400"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {segment.label}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Search, Sort, Hidden toggle, and Grid/List mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          type="search"
          value={filterConfig.searchQuery}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Search current folder..."
          className="min-w-[180px] flex-1 rounded border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-100 placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            aria-label="Sort by field"
            value={sortConfig.field}
            onChange={(event) => onSortFieldChange(event.currentTarget.value as SortField)}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200"
          >
            <option value="name">Sort: Name</option>
            <option value="size">Sort: Size</option>
            <option value="modifiedAt">Sort: Date</option>
            <option value="extension">Sort: Type</option>
          </select>

          <button
            type="button"
            onClick={onToggleSortDirection}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-200"
          >
            {sortConfig.direction === "asc" ? "ASC" : "DESC"}
          </button>

          <button
            type="button"
            onClick={onToggleHidden}
            className={`rounded border px-2 py-1 text-xs font-medium ${
              filterConfig.shouldShowHidden
                ? "border-sky-500 bg-sky-500/20 text-sky-300"
                : "border-neutral-700 bg-neutral-800 text-neutral-300"
            }`}
          >
            Hidden
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
            className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200"
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
        </div>
      </div>
    </header>
  );
}
