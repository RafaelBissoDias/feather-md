import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import type { EditorHandle } from '@/components/Editor'
import { Editor } from '@/components/Editor'
import { FolderPermissionDialog } from '@/components/FolderPermissionDialog'
import { HelpModal } from '@/components/HelpModal'
import { MarkdownToolbar } from '@/components/MarkdownToolbar'
import { Preview } from '@/components/Preview'
import { ResizableDivider } from '@/components/ResizableDivider'
import { Sidebar } from '@/components/Sidebar'
import { StatusBar } from '@/components/StatusBar'
import { TabBar } from '@/components/TabBar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toolbar } from '@/components/Toolbar'
import { useEditor } from '@/hooks/useEditor'
import { useFileSystem } from '@/hooks/useFileSystem'
import { useTabs } from '@/hooks/useTabs'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function App() {
  const { isDark, toggleTheme, downloadFile } = useEditor()
  const { tabs, activeId, activeTab, addTab, closeTab, switchTab, updateContent, openFileAsTab, markSaved, renameTab } = useTabs()
  const { dirHandle, files, openFolder, openFileFromSidebar, saveToHandle, createFile, deleteFile } = useFileSystem(openFileAsTab)

  const hasFS = 'showDirectoryPicker' in window
  const hasDirOpen = !!dirHandle
  const showSidebar = hasFS && hasDirOpen
  const isDesktop = useIsDesktop()

  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  const [splitPercent, setSplitPercent] = useState(50)

  const editorRef = useRef<EditorHandle>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleResize = useCallback((deltaX: number) => {
    if (!splitContainerRef.current) return
    const w = splitContainerRef.current.offsetWidth
    setSplitPercent(p => Math.min(Math.max(p + (deltaX / w) * 100, 20), 80))
  }, [])

  const handleEditorScroll = useCallback((percent: number) => {
    const el = previewRef.current
    if (!el) return
    el.scrollTop = percent * (el.scrollHeight - el.clientHeight)
  }, [])

  const handleSave = useCallback(async () => {
    const { id, title, content, fileHandle } = activeTab
    if (fileHandle) {
      const ok = await saveToHandle(fileHandle, content)
      if (ok) markSaved(id)
    } else {
      downloadFile(title, content)
      markSaved(id)
    }
  }, [activeTab, saveToHandle, markSaved, downloadFile])

  const openFile = useCallback(() => fileInputRef.current?.click(), [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') openFileAsTab(file.name, text)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }, [openFileAsTab])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  const editorStyle = isDesktop ? { width: `${splitPercent}%` } : { height: '50%' }
  const previewStyle = isDesktop ? { width: `${100 - splitPercent}%` } : { height: '50%' }

  // Sidebar active file = active tab's title (if it came from FS)
  const activeFile = activeTab.fileHandle ? activeTab.title : null

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Toolbar
        isDark={isDark}
        hasFS={hasFS}
        hasDirOpen={hasDirOpen}
        onOpenFolder={() => setShowPermissionDialog(true)}
        onOpenFile={openFile}
        onSave={handleSave}
        onPrint={() => window.print()}
        onToggleTheme={toggleTheme}
      />

      <TabBar
        tabs={tabs}
        activeId={activeId}
        onSwitch={switchTab}
        onClose={closeTab}
        onAdd={addTab}
        onRename={renameTab}
      />

      <div className="flex min-h-0 flex-1">
        {showSidebar && (
          <Sidebar
            dirName={dirHandle.name}
            files={files}
            activeFile={activeFile}
            onOpenFolder={() => setShowPermissionDialog(true)}
            onOpenFile={openFileFromSidebar}
            onCreateFile={createFile}
            onDeleteFile={deleteFile}
          />
        )}

        <div ref={splitContainerRef} className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Editor panel */}
          <div className="flex min-h-0 flex-col" style={editorStyle}>
            <MarkdownToolbar editorRef={editorRef} />
            <div className="min-h-0 flex-1">
              <Editor
                ref={editorRef}
                content={activeTab.content}
                onChange={(c) => updateContent(activeId, c)}
                isDark={isDark}
                onCursorChange={(line, col) => setCursor({ line, col })}
                onScroll={handleEditorScroll}
              />
            </div>
          </div>

          <ResizableDivider onResize={handleResize} />
          <Separator orientation="horizontal" className="md:hidden" />

          <div
            ref={previewRef}
            data-print-expand
            className="min-h-0 overflow-y-auto"
            style={previewStyle}
          >
            <Preview content={activeTab.content} />
          </div>
        </div>
      </div>

      <StatusBar content={activeTab.content} cursorLine={cursor.line} cursorCol={cursor.col} />

      <Button
        data-no-print
        variant="ghost"
        size="icon"
        className="fixed bottom-10 right-4 size-9 rounded-full border border-border bg-background shadow-md"
        onClick={() => setShowHelp(true)}
        aria-label="Help"
      >
        <CircleHelp className="size-4" />
      </Button>

      <FolderPermissionDialog
        open={showPermissionDialog}
        onConfirm={async () => { setShowPermissionDialog(false); await openFolder() }}
        onCancel={() => setShowPermissionDialog(false)}
      />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <input ref={fileInputRef} type="file" accept=".md,.txt" className="hidden" onChange={handleFileChange} aria-hidden="true" />
    </div>
  )
}
