// Public API for the navigation feature module.

export type {
  FilterConfig,
  NavigationHistoryState,
  SortConfig,
  SortDirection,
  SortField,
} from "./types";

export {
  canNavigateBack,
  canNavigateForward,
  createNavigationHistory,
  getCurrentPath,
  navigateBack,
  navigateForward,
  navigateToPath,
} from "./history";

export { filterFileEntries, sortFileEntries } from "./sort-and-filter";
