// Custom React hook coordinating explorer navigation, file system IPC, and selection state.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createDirectory,
  createTextFile,
  createVirtualPath,
  DEFAULT_STORAGE_ROOTS,
  deleteFileEntries,
  getAvailableStorageRoots,
  getBreadcrumbSegments,
  getParentVirtualPath,
  listDirectoryEntries,
  openEntryWithSystem,
  pasteFileEntries,
  pickCustomFolder,
  renameFileEntry,
  type FileEntry,
  type StorageRoot,
  type VirtualPath,
} from "@/features/file-system";
import {
  canNavigateBack,
  canNavigateForward,
  createNavigationHistory,
  filterFileEntries,
  getCurrentPath,
  navigateBack,
  navigateForward,
  navigateToPath,
  sortFileEntries,
  type FilterConfig,
  type SortConfig,
  type SortField,
} from "@/features/navigation";
import {
  clearSelection,
  createClipboardState,
  createSelectionState,
  selectAllPaths,
  selectSinglePath,
  togglePathSelection,
  type ClipboardState,
} from "@/features/selection";
import type { ActivePromptModal, ExplorerViewMode } from "./types";

/** Orchestrates explorer state and side effects for the ExplorerShell component. */
export function useExplorerController() {
  const [roots, setRoots] = useState<readonly StorageRoot[]>(DEFAULT_STORAGE_ROOTS);
  const [history, setHistory] = useState(() =>
    createNavigationHistory(createVirtualPath("documents", ""))
  );
  const [rawEntries, setRawEntries] = useState<readonly FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ExplorerViewMode>("grid");
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    searchQuery: "",
    shouldShowHidden: false,
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });
  const [selectionState, setSelectionState] = useState(createSelectionState);
  const [clipboardState, setClipboardState] = useState<ClipboardState | null>(null);
  const [promptModal, setPromptModal] = useState<ActivePromptModal | null>(null);

  const currentPath = useMemo(() => getCurrentPath(history), [history]);
  const parentPath = useMemo(() => getParentVirtualPath(currentPath), [currentPath]);
  const breadcrumbs = useMemo(() => getBreadcrumbSegments(currentPath), [currentPath]);

  const visibleEntries = useMemo(() => {
    const filtered = filterFileEntries(rawEntries, filterConfig);
    return sortFileEntries(filtered, sortConfig);
  }, [rawEntries, filterConfig, sortConfig]);

  /** Loads directory entries for the active VirtualPath via Tauri FS plugin. */
  const refreshCurrentDirectory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const entries = await listDirectoryEntries(currentPath);
      setRawEntries(entries);
      setSelectionState(clearSelection());
    } catch (error) {
      setRawEntries([]);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

  useEffect(() => {
    setRoots(getAvailableStorageRoots());
  }, []);

  useEffect(() => {
    void refreshCurrentDirectory();
  }, [refreshCurrentDirectory]);

  function handleNavigate(targetPath: VirtualPath): void {
    setHistory((prev) => navigateToPath(prev, targetPath));
  }

  async function handleEntryActivate(entry: FileEntry): Promise<void> {
    if (entry.kind === "directory") {
      handleNavigate(entry.path);
      return;
    }
    try {
      await openEntryWithSystem(entry.path);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  function handleEntrySelect(entry: FileEntry, isAdditive: boolean): void {
    setSelectionState((prev) =>
      isAdditive ? togglePathSelection(prev, entry.path) : selectSinglePath(entry.path)
    );
  }

  async function handlePickCustomFolder(): Promise<void> {
    try {
      const pickedPath = await pickCustomFolder();
      if (pickedPath) {
        handleNavigate(pickedPath);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleDeleteSelected(): Promise<void> {
    if (selectionState.selectedPaths.length === 0) {
      return;
    }
    try {
      await deleteFileEntries(selectionState.selectedPaths);
      await refreshCurrentDirectory();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handlePasteClipboard(): Promise<void> {
    if (!clipboardState) {
      return;
    }
    try {
      await pasteFileEntries(
        clipboardState.items,
        currentPath,
        clipboardState.operation
      );
      if (clipboardState.operation === "move") {
        setClipboardState(null);
      }
      await refreshCurrentDirectory();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleConfirmModal(sanitizedName: string): Promise<void> {
    if (!promptModal) {
      return;
    }
    if (promptModal.kind === "createFolder") {
      await createDirectory(currentPath, sanitizedName);
    } else if (promptModal.kind === "createFile") {
      await createTextFile(currentPath, sanitizedName, "");
    } else if (promptModal.kind === "rename" && promptModal.targetPath) {
      await renameFileEntry(promptModal.targetPath, sanitizedName);
    }
    setPromptModal(null);
    await refreshCurrentDirectory();
  }

  return {
    roots,
    currentPath,
    breadcrumbs,
    visibleEntries,
    isLoading,
    errorMessage,
    viewMode,
    isMultiSelectMode,
    filterConfig,
    sortConfig,
    selectionState,
    clipboardState,
    promptModal,
    canGoBack: canNavigateBack(history),
    canGoForward: canNavigateForward(history),
    hasParent: parentPath !== null,
    setViewMode,
    setPromptModal,
    refreshCurrentDirectory: () => void refreshCurrentDirectory(),
    handleNavigate,
    handleNavigateBack: () => setHistory((prev) => navigateBack(prev)),
    handleNavigateForward: () => setHistory((prev) => navigateForward(prev)),
    handleNavigateUp: () => parentPath && handleNavigate(parentPath),
    handleSearchChange: (searchQuery: string) =>
      setFilterConfig((prev) => ({ ...prev, searchQuery })),
    handleToggleHidden: () =>
      setFilterConfig((prev) => ({ ...prev, shouldShowHidden: !prev.shouldShowHidden })),
    handleSortFieldChange: (field: SortField) =>
      setSortConfig((prev) => ({ ...prev, field })),
    handleToggleSortDirection: () =>
      setSortConfig((prev) => ({
        ...prev,
        direction: prev.direction === "asc" ? "desc" : "asc",
      })),
    handleToggleMultiSelectMode: () => setIsMultiSelectMode((prev) => !prev),
    handleSelectAll: () =>
      setSelectionState(selectAllPaths(visibleEntries.map((item) => item.path))),
    handleClearSelection: () => setSelectionState(clearSelection()),
    handleEntryActivate: (entry: FileEntry) => void handleEntryActivate(entry),
    handleEntrySelect,
    handlePickCustomFolder: () => void handlePickCustomFolder(),
    handleCopySelected: () =>
      setClipboardState(createClipboardState("copy", selectionState.selectedPaths)),
    handleMoveSelected: () =>
      setClipboardState(createClipboardState("move", selectionState.selectedPaths)),
    handlePasteClipboard: () => void handlePasteClipboard(),
    handleDeleteSelected: () => void handleDeleteSelected(),
    handleConfirmModal,
  };
}
