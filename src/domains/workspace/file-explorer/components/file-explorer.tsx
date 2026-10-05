"use client";

import {
  MAIN_FILE_KEY,
  type WorkspaceFile,
} from "@/domains/workspace/state/workspace-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";
import {
  ChevronDown,
  FileCode,
  Files,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

const MAIN_FILE_LABEL = "Solution.jsx";
const DEFAULT_EXTENSION = ".jsx";
const KNOWN_EXTENSIONS = [".jsx", ".js", ".tsx", ".ts"];

function normalizedKey(path: string): string {
  const withoutExtension = KNOWN_EXTENSIONS.reduce(
    (name, ext) =>
      name.toLowerCase().endsWith(ext) ? name.slice(0, -ext.length) : name,
    path
  );
  return withoutExtension.toLowerCase();
}

/** Ensures the name has a recognized extension and doesn't collide (by
 *  extension-insensitive basename) with an existing file, matching how the
 *  backend/preview both resolve `require("./Foo")` regardless of the
 *  extension a file was actually saved with. Collisions get a numeric
 *  suffix rather than blocking, since that's the lower-friction default. */
function resolveNewFileName(raw: string, existingPaths: string[]): string {
  let name = raw.trim() || "NewFile";
  if (!KNOWN_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))) {
    name += DEFAULT_EXTENSION;
  }

  const reservedKeys = new Set([
    normalizedKey(MAIN_FILE_LABEL),
    ...existingPaths.map(normalizedKey),
  ]);

  if (!reservedKeys.has(normalizedKey(name))) return name;

  const dotIndex = name.lastIndexOf(".");
  const base = name.slice(0, dotIndex);
  const extension = name.slice(dotIndex);

  let counter = 2;
  let candidate = `${base}${counter}${extension}`;
  while (reservedKeys.has(normalizedKey(candidate))) {
    counter += 1;
    candidate = `${base}${counter}${extension}`;
  }
  return candidate;
}

type FileRowProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

const FileRow = forwardRef<
  HTMLButtonElement,
  FileRowProps &
    Omit<ComponentPropsWithoutRef<"button">, "onClick" | "children">
>(({ label, active, onClick, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-sm truncate",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      <FileCode size={14} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
});
FileRow.displayName = "FileRow";

type FileNameInputProps = {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  placeholder?: string;
};

function FileNameInput({
  value,
  onChange,
  onCommit,
  onCancel,
  placeholder,
}: Readonly<FileNameInputProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit();
        if (e.key === "Escape") onCancel();
      }}
      placeholder={placeholder}
      className="w-full rounded-sm border bg-background px-1.5 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  );
}

type DeletableFileRowProps = FileRowProps & {
  onDelete: () => void;
  onRename: (raw: string) => void;
};

function DeletableFileRow({
  label,
  active,
  onClick,
  onDelete,
  onRename,
}: Readonly<DeletableFileRowProps>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(label);

  function commitRename() {
    setIsRenaming(false);
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== label) onRename(trimmed);
  }

  if (isRenaming) {
    return (
      <FileNameInput
        value={renameValue}
        onChange={setRenameValue}
        onCommit={commitRename}
        onCancel={() => setIsRenaming(false)}
      />
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <FileRow label={label} active={active} onClick={onClick} />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onSelect={() => {
              setRenameValue(label);
              setIsRenaming(true);
            }}
          >
            <Pencil />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            variant="destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the file and its contents. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type FileExplorerProps = {
  files: WorkspaceFile[];
  activeKey: string;
  onSelectFile: (key: string) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
};

export default function FileExplorer({
  files,
  activeKey,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
}: Readonly<FileExplorerProps>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  function commitNewFile() {
    const trimmed = newFileName.trim();
    setIsAddingFile(false);
    setNewFileName("");
    if (!trimmed) return;
    onAddFile(
      resolveNewFileName(
        trimmed,
        files.map((f) => f.path)
      )
    );
  }

  if (isCollapsed) {
    return (
      <button
        type="button"
        title="Show files"
        onClick={() => setIsCollapsed(false)}
        className="flex w-10 shrink-0 flex-col items-center rounded-md border bg-sidebar py-2 text-muted-foreground hover:text-foreground"
      >
        <Files size={18} />
      </button>
    );
  }

  return (
    <div className="flex w-48 shrink-0 flex-col rounded-md border bg-sidebar">
      <div className="flex items-center justify-between border-b px-2 py-1.5">
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground hover:text-foreground"
        >
          <Files size={14} />
          FILES
          <ChevronDown size={14} />
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          title="New file"
          onClick={() => setIsAddingFile(true)}
        >
          <Plus size={14} />
        </Button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-1 py-1">
        <FileRow
          label={MAIN_FILE_LABEL}
          active={activeKey === MAIN_FILE_KEY}
          onClick={() => onSelectFile(MAIN_FILE_KEY)}
        />
        {files.map((file) => (
          <DeletableFileRow
            key={file.path}
            label={file.path}
            active={activeKey === file.path}
            onClick={() => onSelectFile(file.path)}
            onDelete={() => onDeleteFile(file.path)}
            onRename={(raw) => {
              const otherPaths = files
                .filter((f) => f.path !== file.path)
                .map((f) => f.path);
              onRenameFile(file.path, resolveNewFileName(raw, otherPaths));
            }}
          />
        ))}

        {isAddingFile && (
          <FileNameInput
            value={newFileName}
            onChange={setNewFileName}
            onCommit={commitNewFile}
            onCancel={() => {
              setIsAddingFile(false);
              setNewFileName("");
            }}
            placeholder="NewFile.jsx"
          />
        )}
      </div>
    </div>
  );
}
