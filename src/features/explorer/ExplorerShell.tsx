// Top-level responsive file manager shell combining navigation, toolbars, and entry views.

"use client";

import { useState } from "react";
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

return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
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
