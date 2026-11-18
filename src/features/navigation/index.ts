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

export {
  isInwardEdgeBackSwipe,
  resolveBackNavigationAction,
} from "./back-gesture";
export type {
  BackNavigationAction,
  BackNavigationContext,
  EdgeSwipeInput,
} from "./back-gesture";

export { filterFileEntries, sortFileEntries } from "./sort-and-filter";
