import { useRef, useState } from 'react'
import { File, FilePlus, FolderOpen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FSFile } from '@/hooks/useFileSystem'

interface SidebarProps {
  dirName: string
  files: FSFile[]
  activeFile: string | null
  onOpenFolder: () => void
  onOpenFile: (file: FSFile) => void
  onCreateFile: (name: string) => void
  onDeleteFile: (name: string) => void
}

export function Sidebar({
  dirName,
  files,
  activeFile,
  onOpenFolder,
  onOpenFile,
  onCreateFile,
  onDeleteFile,
}: SidebarProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startCreating = () => {
    setCreating(true)
    setNewName('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const confirmCreate = () => {
    const name = newName.trim()
    if (name) onCreateFile(name)
    setCreating(false)
    setNewName('')
  }

  const cancelCreate = () => {
    setCreating(false)
    setNewName('')
  }

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-muted/20">
      {/* Folder header */}
      <div className="flex items-center gap-1.5 border-b border-border px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={onOpenFolder}
          aria-label="Change folder"
        >
          <FolderOpen className="size-3.5" />
        </Button>
        <span
          className="truncate text-xs font-medium text-muted-foreground"
          title={dirName}
        >
          {dirName}
        </span>
      </div>

      {/* File list */}
      <ul className="flex-1 overflow-y-auto py-1" role="listbox" aria-label="Files">
        {files.map((file) => (
          <li
            key={file.name}
            role="option"
            aria-selected={activeFile === file.name}
            className={cn(
              'group flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-xs',
              'hover:bg-accent hover:text-accent-foreground',
              activeFile === file.name && 'bg-accent text-accent-foreground',
            )}
            onClick={() => onOpenFile(file)}
          >
            <File className="size-3 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteFile(file.name)
              }}
              aria-label={`Delete ${file.name}`}
            >
              <Trash2 className="size-3 text-destructive" />
            </Button>
          </li>
        ))}

        {files.length === 0 && (
          <li className="px-3 py-3 text-xs text-muted-foreground">
            No .md files in folder
          </li>
        )}
      </ul>

      {/* New file */}
      <div className="border-t border-border p-2">
        {creating ? (
          <input
            ref={inputRef}
            className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholder="filename.md"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmCreate()
              if (e.key === 'Escape') cancelCreate()
            }}
            onBlur={confirmCreate}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={startCreating}
          >
            <FilePlus className="size-3.5" />
            New file
          </Button>
        )}
      </div>
    </aside>
  )
}
