// Responsive storage root and OS drive navigation rendering a desktop sidebar and mobile bottom bar.

import { useEffect, useState } from "react";
import {
  createVirtualPath,
  getAvailableSystemDrives,
  type StorageRoot,
  type SystemDrive,
  type VirtualPath,
} from "@/features/file-system";
import type { ResolvedTheme } from "@/features/settings";
import {
  AppLogoIcon,
  FolderPlusIcon,
  HardDriveIcon,
  RootLocationIcon,
  SettingsIcon,
} from "./ExplorerIcons";
import { formatCustomMountLabel } from "./formatters";

export interface StorageNavigationProps {
  readonly roots: readonly StorageRoot[];
  readonly currentPath: VirtualPath;
  readonly resolvedTheme: ResolvedTheme;
  readonly onSelectRoot: (targetPath: VirtualPath) => void;
  readonly onPickCustomFolder: () => void;
  readonly onOpenSettings: () => void;
}

/** Normalizes a mount path for Windows and Linux drive comparisons. */
function normalizeMountKey(rawPath: string | undefined): string {
  if (!rawPath) {
    return "";
  }
  const unified = rawPath.replace(/\\/g, "/").trim();
  if (unified === "/") {
    return "/";
  }
  return unified.replace(/\/+$/, "").toLowerCase();
}

/** Renders both the desktop left sidebar (Locations + Drives) and the mobile bottom bar. */
export function StorageNavigation({
  roots,
  currentPath,
  resolvedTheme,
  onSelectRoot,
  onPickCustomFolder,
  onOpenSettings,
}: StorageNavigationProps) {
  const [systemDrives, setSystemDrives] = useState<readonly SystemDrive[]>([]);

  useEffect(() => {
    let isMounted = true;
    getAvailableSystemDrives().then((drives) => {
      if (isMounted) {
        setSystemDrives(drives);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [roots]);

  const activeMountKey = normalizeMountKey(currentPath.mountPrefix);
  const isSystemDriveActive =
    currentPath.rootId === "customDrive" &&
    systemDrives.some((drive) => normalizeMountKey(drive.mountPath) === activeMountKey);
  const isCustomMountActive =
    currentPath.rootId === "customDrive" &&
    Boolean(currentPath.mountPrefix) &&
    !isSystemDriveActive;
  const customMountLabel = formatCustomMountLabel(currentPath.mountPrefix);

  return (
    <>
      {/* Desktop persistent left sidebar */}
      <aside
        aria-label="Storage locations"
        className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-panel md:p-3.5"
      >
        {/* App brand header */}
        <div className="mb-5 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
              <AppLogoIcon className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none tracking-tight text-foreground">
                One Place
              </h1>
              <p className="mt-1 text-[11px] font-medium text-muted">
                File Manager
              </p>
            </div>
          </div>
          <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-500">
            v0.1
          </span>
        </div>

        {/* Standard cross-platform locations */}
        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Locations
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {roots.map((root) => {
            const isActiveRoot =
              currentPath.rootId === root.id &&
              !isCustomMountActive &&
              !isSystemDriveActive;
            return (
              <button
                key={root.id}
                type="button"
                onClick={() => onSelectRoot(root.rootPath)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${
                  isActiveRoot
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-foreground/80 hover:bg-elevated hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <RootLocationIcon
                    rootId={root.id}
                    className={`h-4 w-4 shrink-0 ${
                      isActiveRoot
                        ? "text-white"
                        : "text-sky-500 group-hover:text-sky-400"
                    }`}
                  />
                  <span className="truncate">{root.label}</span>
                </span>
                {isActiveRoot && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}

          {/* Detected Windows system drives (C:/, D:/, E:/, etc.) */}
          {systemDrives.length > 0 && (
            <div className="mt-3">
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Drives
              </div>
              <div className="flex flex-col gap-1">
                {systemDrives.map((drive) => {
                  const isActiveDrive =
                    currentPath.rootId === "customDrive" &&
                    normalizeMountKey(drive.mountPath) === activeMountKey;
                  return (
                    <button
                      key={drive.id}
                      type="button"
                      onClick={() => onSelectRoot(drive.rootPath)}
                      title={drive.mountPath}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${
                        isActiveDrive
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-foreground/80 hover:bg-elevated hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <HardDriveIcon
                          className={`h-4 w-4 shrink-0 ${
                            isActiveDrive
                              ? "text-white"
                              : "text-sky-500 group-hover:text-sky-400"
                          }`}
                        />
                        <span className="truncate">{drive.label}</span>
                      </span>
                      {isActiveDrive && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active mounted folder indicator when browsing a non-drive custom folder */}
          {isCustomMountActive && (
            <div className="mt-3">
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Mounted Folder
              </div>
              <button
                type="button"
                onClick={() =>
                  onSelectRoot(
                    createVirtualPath("customDrive", "", currentPath.mountPrefix)
                  )
                }
                title={currentPath.mountPrefix}
                className="flex w-full items-center justify-between rounded-xl bg-sky-600 px-3 py-2 text-left text-xs font-medium text-white shadow-sm"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <RootLocationIcon
                    rootId="customDrive"
                    className="h-4 w-4 shrink-0 text-white"
                  />
                  <span className="truncate">{customMountLabel}</span>
                </span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              </button>
            </div>
          )}
        </nav>

        {/* Bottom actions: Open Folder & Settings */}
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3">
          <button
            type="button"
            onClick={onPickCustomFolder}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-elevated px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-sky-500"
          >
            <FolderPlusIcon className="h-4 w-4 text-sky-500" />
            <span>Open Folder...</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-elevated hover:text-foreground"
          >
            <span className="flex items-center gap-2.5">
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </span>
            <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] font-semibold uppercase text-foreground">
              {resolvedTheme}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile fixed bottom navigation bar */}
      <nav
        aria-label="Mobile storage locations"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-1 overflow-x-auto border-t border-border bg-panel/95 px-2 py-1.5 backdrop-blur md:hidden"
      >
        {systemDrives.map((drive) => {
          const isActiveDrive =
            currentPath.rootId === "customDrive" &&
            normalizeMountKey(drive.mountPath) === activeMountKey;
          return (
            <button
              key={drive.id}
              type="button"
              onClick={() => onSelectRoot(drive.rootPath)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${
                isActiveDrive
                  ? "bg-sky-600 text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <HardDriveIcon className="h-4 w-4" />
              <span>{drive.label}</span>
            </button>
          );
        })}

        {roots.map((root) => {
          const isActiveRoot =
            currentPath.rootId === root.id &&
            !isCustomMountActive &&
            !isSystemDriveActive;
          return (
            <button
              key={root.id}
              type="button"
              onClick={() => onSelectRoot(root.rootPath)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${
                isActiveRoot
                  ? "bg-sky-600 text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <RootLocationIcon rootId={root.id} className="h-4 w-4" />
              <span>{root.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onPickCustomFolder}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium text-muted hover:text-foreground"
        >
          <FolderPlusIcon className="h-4 w-4 text-sky-500" />
          <span>Folder</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium text-muted hover:text-foreground"
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
}
