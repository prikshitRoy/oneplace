// Responsive storage root navigation rendering a desktop sidebar and a mobile bottom bar.

import type { StorageRoot, VirtualPath } from "@/features/file-system";

export interface StorageNavigationProps {
  readonly roots: readonly StorageRoot[];
  readonly currentPath: VirtualPath;
  readonly onSelectRoot: (targetPath: VirtualPath) => void;
  readonly onPickCustomFolder: () => void;
}

/** Renders both the desktop left sidebar and the mobile bottom navigation bar. */
export function StorageNavigation({
  roots,
  currentPath,
  onSelectRoot,
  onPickCustomFolder,
}: StorageNavigationProps) {
  return (
    <>
      {/* Desktop persistent left sidebar */}
      <aside
        aria-label="Storage locations"
        className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-neutral-800 md:bg-neutral-900/60 md:p-3"
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-lg font-bold tracking-tight text-white">
            One Place
          </span>
          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-xs font-medium text-sky-300">
            v0.1
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {roots.map((root) => {
            const isActiveRoot = currentPath.rootId === root.id;
            return (
              <button
                key={root.id}
                type="button"
                onClick={() => onSelectRoot(root.rootPath)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActiveRoot
                    ? "bg-sky-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <span>{root.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onPickCustomFolder}
          className="mt-4 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-sky-500 hover:text-white"
        >
          + Open Folder...
        </button>
      </aside>

      {/* Mobile fixed bottom navigation bar */}
      <nav
        aria-label="Mobile storage locations"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-neutral-800 bg-neutral-900/95 px-2 py-1.5 backdrop-blur md:hidden"
      >
        {roots.map((root) => {
          const isActiveRoot = currentPath.rootId === root.id;
          return (
            <button
              key={root.id}
              type="button"
              onClick={() => onSelectRoot(root.rootPath)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActiveRoot
                  ? "bg-sky-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {root.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onPickCustomFolder}
          className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-200"
        >
          + Folder
        </button>
      </nav>
    </>
  );
}
