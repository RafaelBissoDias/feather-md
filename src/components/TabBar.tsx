import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Tab } from '@/hooks/useTabs'
import { cn } from '@/lib/utils'

interface TabBarProps {
  tabs: Tab[]
  activeId: string
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onAdd: () => void
  onRename: (id: string, title: string) => void
}

export function TabBar({ tabs, activeId, onSwitch, onClose, onAdd, onRename }: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (tab: Tab, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(tab.id)
    setEditTitle(tab.title)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = () => {
    if (editingId) onRename(editingId, editTitle || 'Untitled')
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div
      data-no-print
      className="flex items-stretch overflow-x-auto border-b border-border bg-muted/10"
      style={{ scrollbarWidth: 'none' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        const isEditing = editingId === tab.id

        return (
          <div
            key={tab.id}
            onClick={() => !isEditing && onSwitch(tab.id)}
            className={cn(
              'group relative flex min-w-0 max-w-44 shrink-0 cursor-pointer items-center gap-1.5 border-r border-border px-3 py-2 text-xs select-none transition-colors',
              isActive
                ? 'bg-background text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
            )}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                className="w-28 min-w-0 bg-transparent text-xs outline-none border-b border-primary"
              />
            ) : (
              <span className="truncate" onDoubleClick={e => startEdit(tab, e)}>
                {tab.title}
              </span>
            )}

            {/* Dirty dot — visible when dirty, hidden on hover (close button takes over) */}
            {!isEditing && tab.isDirty && (
              <span className="size-1.5 shrink-0 rounded-full bg-primary/70 group-hover:hidden" />
            )}

            {/* Close button — only when >1 tab, appears on hover */}
            {!isEditing && tabs.length > 1 && (
              <span
                role="button"
                aria-label={`Close ${tab.title}`}
                onClick={e => { e.stopPropagation(); onClose(tab.id) }}
                className={cn(
                  'flex shrink-0 items-center justify-center rounded p-0.5 hover:bg-muted',
                  tab.isDirty ? 'hidden group-hover:flex' : 'opacity-0 group-hover:opacity-100',
                )}
              >
                <X className="size-3" />
              </span>
            )}
          </div>
        )
      })}

      <button
        onClick={onAdd}
        className="flex shrink-0 items-center px-2 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        aria-label="New tab"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
