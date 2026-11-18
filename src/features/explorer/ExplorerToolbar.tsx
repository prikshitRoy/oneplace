// Top navigation toolbar with icon history controls, recessed breadcrumb bar, search, and view switcher.

import type { BreadcrumbSegment, VirtualPath } from "@/features/file-system";
import type { FilterConfig, SortConfig, SortField } from "@/features/navigation";
import { RootLocationIcon } from "./ExplorerIcons";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  EyeIcon,
  GridViewIcon,
  ListViewIcon,
  RefreshIcon,
  SearchIcon,
} from "./ToolbarIcons";
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

/** Renders the top navigation cluster, clickable address bar, search input, and view controls. */
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
  const activeRootId = breadcrumbs[0]?.targetPath.rootId ?? "documents";

  return (
    <header className="flex flex-col gap-2.5 border-b border-border bg-panel px-4 pb-2.5 pt-[max(env(safe-area-inset-top),2.25rem)] md:py-2.5">
      {/* Top row: Navigation icon cluster + Recessed Breadcrumb Address Bar + Search */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Back / Forward / Up / Refresh icon cluster */}
        <div className="flex items-center rounded-xl border border-border bg-elevated p-0.5">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onNavigateBack}
            title="Back"
            aria-label="Navigate back"
            className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-panel disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={onNavigateForward}
            title="Forward"
            aria-label="Navigate forward"
            className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-panel disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!hasParent}
            onClick={onNavigateUp}
            title="Parent folder"
            aria-label="Navigate to parent folder"
            className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-panel disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh folder"
            aria-label="Refresh directory"
            className="rounded-lg p-1.5 text-foreground transition-colors hover:bg-panel"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Recessed clickable breadcrumb address bar */}
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-[200px] flex-1 items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background px-3 py-1.5 text-xs shadow-inner"
        >
          <RootLocationIcon
            rootId={activeRootId}
            className="mr-1 h-4 w-4 shrink-0 text-sky-500"
          />
          {breadcrumbs.map((segment, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div
                key={`${segment.label}-${index}`}
                className="flex shrink-0 items-center gap-1"
              >
                {index > 0 && (
                  <ChevronRightIcon className="h-3.5 w-3.5 text-muted" />
                )}
                <button
                  type="button"
                  onClick={() => onSelectBreadcrumb(segment.targetPath)}
                  className={`truncate rounded-md px-2 py-0.5 transition-colors ${
                    isLast
                      ? "bg-sky-500/15 font-semibold text-sky-500"
                      : " font-medium text-muted hover:bg-elevated hover:text-foreground"
                  }`}
                >
                  {segment.label}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Search input with icon and clear button */}
        <div className="relative flex min-w-[190px] items-center sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted" />
          <input
            type="search"
            value={filterConfig.searchQuery}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder="Filter current folder..."
            aria-label="Filter current folder"
            className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-7 text-xs text-foreground placeholder-muted focus:border-sky-500 focus:outline-none"
          />
          {filterConfig.searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search filter"
              className="absolute right-2 rounded px-1 text-xs font-bold text-muted hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Secondary row: Sort selector, Hidden files toggle, and Grid/List segmented control */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Sort field + direction pill */}
          <div className="flex items-center rounded-lg border border-border bg-elevated px-2 py-1">
            <span className="mr-1.5 text-[11px] font-medium text-muted">Sort:</span>
            <select
              aria-label="Sort by field"
              value={sortConfig.field}
              onChange={(event) =>
                onSortFieldChange(event.currentTarget.value as SortField)
              }
              className="bg-transparent font-medium text-foreground focus:outline-none"
            >
              <option value="name" className="bg-panel text-foreground">Name</option>
              <option value="size" className="bg-panel text-foreground">Size</option>
              <option value="modifiedAt" className="bg-panel text-foreground">Modified</option>
              <option value="extension" className="bg-panel text-foreground">Type</option>
            </select>
            <button
              type="button"
              onClick={onToggleSortDirection}
              title={`Sort ${sortConfig.direction === "asc" ? "ascending" : "descending"}`}
              className="ml-1.5 rounded bg-panel px-1.5 py-0.5 text-[10px] font-bold text-sky-500 hover:bg-sky-500/15"
            >
              {sortConfig.direction === "asc" ? "↑ ASC" : "↓ DESC"}
            </button>
          </div>

          {/* Show/Hide dot-files toggle */}
          <button
            type="button"
            onClick={onToggleHidden}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium transition-colors ${
              filterConfig.shouldShowHidden
                ? "border-sky-500/60 bg-sky-500/15 text-sky-500"
                : "border-border bg-elevated text-muted hover:text-foreground"
            }`}
          >
            <EyeIcon isVisible={filterConfig.shouldShowHidden} className="h-3.5 w-3.5" />
            <span>Hidden</span>
          </button>
        </div>

        {/* Segmented Grid / List view switcher */}
        <div
          role="group"
          aria-label="View mode"
          className="flex items-center rounded-lg border border-border bg-elevated p-0.5"
        >
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <GridViewIcon className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === "list"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ListViewIcon className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>
    </header>
  );
}
