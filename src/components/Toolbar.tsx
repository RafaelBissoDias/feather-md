import { File, FolderOpen, Moon, Save, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ToolbarProps {
  isDark: boolean
  hasFS: boolean
  hasDirOpen: boolean
  onOpenFolder: () => void
  onOpenFile: () => void
  onSave: () => void
  onToggleTheme: () => void
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="ghost" size="icon" onClick={onClick} aria-label={label}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function Toolbar({
  isDark,
  hasFS,
  hasDirOpen,
  onOpenFolder,
  onOpenFile,
  onSave,
  onToggleTheme,
}: ToolbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-2">
      <div className="flex items-center gap-2">
        <img src="/feathermd.svg" alt="" className="size-6 shrink-0" />
        <span className="select-none font-semibold tracking-tight text-foreground">
          Feather<span className="text-primary">MD</span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        {hasFS ? (
          <ToolbarButton
            label={hasDirOpen ? 'Change folder' : 'Open folder'}
            onClick={onOpenFolder}
          >
            <FolderOpen className="size-4" />
          </ToolbarButton>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <span className="flex size-9 cursor-default items-center justify-center opacity-30">
                <FolderOpen className="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Folder access requires Chrome or Edge (Brave: disable Shields)
            </TooltipContent>
          </Tooltip>
        )}
        <ToolbarButton label="Open file" onClick={onOpenFile}>
          <File className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={hasDirOpen ? 'Save to file' : 'Download file'}
          onClick={onSave}
        >
          <Save className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </ToolbarButton>
      </div>
    </header>
  )
}
