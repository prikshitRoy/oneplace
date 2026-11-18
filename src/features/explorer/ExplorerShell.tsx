// Top-level responsive file manager shell combining navigation, toolbars, and entry views.

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import {
  isInwardEdgeBackSwipe,
  resolveBackNavigationAction,
} from "@/features/navigation";
import { SettingsModal, useThemeSettings } from "@/features/settings";
import { ActionToolbar } from "./ActionToolbar";
import { ExplorerToolbar } from "./ExplorerToolbar";
import { FileEntryCollection } from "./FileEntryCollection";
import { NamePromptModal } from "./NamePromptModal";
import { StorageNavigation } from "./StorageNavigation";
import { useExplorerController } from "./useExplorerController";

/** Renders the complete cross-platform One Place file explorer workspace. */
export function ExplorerShell() {
  const controller = useExplorerController();
  const theme = useThemeSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastBackActionMsRef = useRef<number>(0);

  function openRenameModal(): void {
    const selectedTarget = controller.selectionState.selectedPaths[0];
    if (!selectedTarget) {
      return;
    }
    const segments = selectedTarget.relativePath.split("/");
    const currentName = segments[segments.length - 1] ?? "";
    controller.setPromptModal({
      kind: "rename",
      title: "Rename Item",
      initialValue: currentName,
      targetPath: selectedTarget,
    });
  }

  const activeBackAction = useMemo(
    () =>
      resolveBackNavigationAction({
        hasOpenModal: controller.promptModal !== null || isSettingsOpen,
        hasSelection: controller.selectionState.selectedPaths.length > 0,
        isMultiSelectMode: controller.isMultiSelectMode,
        canNavigateBack: controller.canGoBack,
        hasParentDirectory: controller.hasParent,
      }),
    [
      controller.canGoBack,
      controller.hasParent,
      controller.isMultiSelectMode,
      controller.promptModal,
      controller.selectionState.selectedPaths.length,
      isSettingsOpen,
    ]
  );


const executeBackNavigation = useCallback((): boolean => {
    const now = Date.now();
    // If a touch edge-swipe and OS back event fire together within 300ms, report handled (true) without double-jumping
    if (now - lastBackActionMsRef.current < 300) {
      return true;
    }

    if (activeBackAction === "close-modal") {
      lastBackActionMsRef.current = now;
      controller.setPromptModal(null);
      setIsSettingsOpen(false);
      return true;
    }

    if (activeBackAction === "clear-selection") {
      lastBackActionMsRef.current = now;
      controller.handleClearSelection();
      if (controller.isMultiSelectMode) {
        controller.handleToggleMultiSelectMode();
      }
      return true;
    }

    if (activeBackAction === "history-back") {
      lastBackActionMsRef.current = now;
      controller.handleNavigateBack();
      return true;
    }

    if (activeBackAction === "parent-folder") {
      lastBackActionMsRef.current = now;
      controller.handleNavigateUp();
      return true;
    }

    return false;
  }, [activeBackAction, controller]);

  // Expose native Android back hook for MainActivity.kt OnBackPressedCallback
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const win = window as unknown as {
      __ONE_PLACE_HANDLE_BACK__?: () => boolean;
    };
    win.__ONE_PLACE_HANDLE_BACK__ = () => executeBackNavigation();
    return () => {
      delete win.__ONE_PLACE_HANDLE_BACK__;
    };
  }, [executeBackNavigation]);

  // Push a browser history guard on each navigation state change for WebView popstate fallback
  useEffect(() => {
    if (typeof window === "undefined" || activeBackAction === "none") {
      return;
    }

    window.history.pushState({ onePlaceBackGuard: true }, "");

    const handlePopState = () => {
      const handled = executeBackNavigation();
      if (handled) {
        window.history.pushState({ onePlaceBackGuard: true }, "");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    activeBackAction,
    controller.currentPath,
    controller.promptModal,
    controller.selectionState.selectedPaths.length,
    executeBackNavigation,
    isSettingsOpen,
  ]);

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const firstTouch = event.touches[0];
    if (!firstTouch) {
      return;
    }
    touchStartRef.current = {
      x: firstTouch.clientX,
      y: firstTouch.clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      const endTouch = event.changedTouches[0];
      if (!start || !endTouch || typeof window === "undefined") {
        return;
      }

      const isEdgeBack = isInwardEdgeBackSwipe({
        startX: start.x,
        startY: start.y,
        endX: endTouch.clientX,
        endY: endTouch.clientY,
        viewportWidth: window.innerWidth || 390,
      });

      if (isEdgeBack) {
        executeBackNavigation();
      }
    },
    [executeBackNavigation]
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground"
    >
      <StorageNavigation
        roots={controller.roots}
        currentPath={controller.currentPath}
        resolvedTheme={theme.resolvedTheme}
        onSelectRoot={controller.handleNavigate}
        onPickCustomFolder={controller.handlePickCustomFolder}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden pb-12 md:pb-0">
        <ExplorerToolbar
          breadcrumbs={controller.breadcrumbs}
          canGoBack={controller.canGoBack}
          canGoForward={controller.canGoForward}
          hasParent={controller.hasParent}
          filterConfig={controller.filterConfig}
          sortConfig={controller.sortConfig}
          viewMode={controller.viewMode}
          onNavigateBack={controller.handleNavigateBack}
          onNavigateForward={controller.handleNavigateForward}
          onNavigateUp={controller.handleNavigateUp}
          onRefresh={controller.refreshCurrentDirectory}
          onSelectBreadcrumb={controller.handleNavigate}
          onSearchChange={controller.handleSearchChange}
          onToggleHidden={controller.handleToggleHidden}
          onSortFieldChange={controller.handleSortFieldChange}
          onToggleSortDirection={controller.handleToggleSortDirection}
          onViewModeChange={controller.setViewMode}
        />

        <ActionToolbar
          selectedCount={controller.selectionState.selectedPaths.length}
          isMultiSelectMode={controller.isMultiSelectMode}
          clipboardState={controller.clipboardState}
          onOpenCreateFolder={() =>
            controller.setPromptModal({
              kind: "createFolder",
              title: "Create New Folder",
              initialValue: "",
            })
          }
          onOpenCreateFile={() =>
            controller.setPromptModal({
              kind: "createFile",
              title: "Create New Text File",
              initialValue: "notes.txt",
            })
          }
          onToggleMultiSelectMode={controller.handleToggleMultiSelectMode}
          onSelectAll={controller.handleSelectAll}
          onClearSelection={controller.handleClearSelection}
          onRenameSelected={openRenameModal}
          onCopySelected={controller.handleCopySelected}
          onMoveSelected={controller.handleMoveSelected}
          onPasteClipboard={controller.handlePasteClipboard}
          onDeleteSelected={controller.handleDeleteSelected}
        />

        {controller.errorMessage && (
          <div
            role="alert"
            className="border-b border-rose-800/80 bg-rose-950/60 px-4 py-2 text-xs text-rose-200"
          >
            {controller.errorMessage}
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-background">
          {controller.isLoading ? (
            <div className="flex h-48 items-center justify-center text-xs font-medium text-muted">
              Loading directory contents...
            </div>
          ) : (
            <FileEntryCollection
              entries={controller.visibleEntries}
              selectionState={controller.selectionState}
              viewMode={controller.viewMode}
              isMultiSelectMode={controller.isMultiSelectMode}
              onEntryActivate={controller.handleEntryActivate}
              onEntrySelect={controller.handleEntrySelect}
            />
          )}
        </main>

        <footer className="flex items-center justify-between border-t border-border bg-panel px-4 py-1.5 text-[11px] font-medium text-muted">
          <div className="flex items-center gap-3">
            <span>{controller.visibleEntries.length} items</span>
            {controller.selectionState.selectedPaths.length > 0 && (
              <span className="font-semibold text-sky-500">
                • {controller.selectionState.selectedPaths.length} selected
              </span>
            )}
          </div>
          <span className="truncate">
            Location: {controller.currentPath.mountPrefix || controller.currentPath.rootId}
          </span>
        </footer>
      </div>

      {controller.promptModal && (
        <NamePromptModal
          modal={controller.promptModal}
          onConfirm={controller.handleConfirmModal}
          onCancel={() => controller.setPromptModal(null)}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        themeMode={theme.themeMode}
        resolvedTheme={theme.resolvedTheme}
        onSelectThemeMode={theme.setThemeMode}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
