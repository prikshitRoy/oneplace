// Pure edge-swipe gesture detection and mobile back-navigation priority resolution.

/** Touch coordinates and viewport width used to evaluate an inward edge swipe. */
export interface EdgeSwipeInput {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly viewportWidth: number;
  readonly edgeZonePx?: number;
  readonly minSwipeDistancePx?: number;
}

/** State flags used to decide what a mobile Back gesture should do first. */
export interface BackNavigationContext {
  readonly hasOpenModal: boolean;
  readonly hasSelection: boolean;
  readonly isMultiSelectMode: boolean;
  readonly canNavigateBack: boolean;
  readonly hasParentDirectory: boolean;
}

/** Ordered action resolved when the user triggers a back swipe or OS back press. */
export type BackNavigationAction =
  | "close-modal"
  | "clear-selection"
  | "history-back"
  | "parent-folder"
  | "none";

const DEFAULT_EDGE_ZONE_PX = 40;
const DEFAULT_MIN_SWIPE_DISTANCE_PX = 48;
const MAX_VERTICAL_DRIFT_RATIO = 0.75;

/**
 * Returns true when a touch gesture starts near the left or right screen edge
 * and swipes inward horizontally toward the center of the screen.
 */
export function isInwardEdgeBackSwipe(input: EdgeSwipeInput): boolean {
  const edgeZone = input.edgeZonePx ?? DEFAULT_EDGE_ZONE_PX;
  const minDistance = input.minSwipeDistancePx ?? DEFAULT_MIN_SWIPE_DISTANCE_PX;

  if (input.viewportWidth <= 0) {
    return false;
  }

  const deltaX = input.endX - input.startX;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(input.endY - input.startY);

  // Reject short taps or vertical scrolling gestures
  if (absDeltaX < minDistance || absDeltaY > absDeltaX * MAX_VERTICAL_DRIFT_RATIO) {
    return false;
  }

  const startedAtLeftEdge = input.startX <= edgeZone;
  const startedAtRightEdge = input.startX >= input.viewportWidth - edgeZone;

  const swipedRightFromLeftEdge = startedAtLeftEdge && deltaX >= minDistance;
  const swipedLeftFromRightEdge = startedAtRightEdge && deltaX <= -minDistance;

  return swipedRightFromLeftEdge || swipedLeftFromRightEdge;
}

/** Resolves the highest-priority back action for mobile/Android back navigation. */
export function resolveBackNavigationAction(
  context: BackNavigationContext
): BackNavigationAction {
  if (context.hasOpenModal) {
    return "close-modal";
  }
  if (context.hasSelection || context.isMultiSelectMode) {
    return "clear-selection";
  }
  if (context.canNavigateBack) {
    return "history-back";
  }
  if (context.hasParentDirectory) {
    return "parent-folder";
  }
  return "none";
}
