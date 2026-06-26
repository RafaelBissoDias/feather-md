import { useEffect, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { Editor } from '@/components/Editor'
import { FolderPermissionDialog } from '@/components/FolderPermissionDialog'
import { HelpModal } from '@/components/HelpModal'
import { Preview } from '@/components/Preview'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toolbar } from '@/components/Toolbar'
import { useEditor } from '@/hooks/useEditor'
import { useFileSystem } from '@/hooks/useFileSystem'

export default function App() {
  const {
    content,
    setContent,
    isDark,
    toggleTheme,
    openFile,
    saveFile,
    fileInputRef,
    handleFileChange,
  } = useEditor()

  const {
    dirHandle,
    files,
    activeFile,
    openFolder,
    openFileFromSidebar,
    saveActiveFile,
    createFile,
    deleteFile,
  } = useFileSystem(content, setContent)

  const hasFS = 'showDirectoryPicker' in window
  const hasDirOpen = !!dirHandle
  const showSidebar = hasFS && hasDirOpen

  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleRequestFolder = () => setShowPermissionDialog(true)

  const handlePermissionConfirm = async () => {
    setShowPermissionDialog(false)
    await openFolder()
  }

  const handleSave = async () => {
    if (hasDirOpen) {
      await saveActiveFile()
    } else {
      saveFile()
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasDirOpen, saveActiveFile, saveFile])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Toolbar
        isDark={isDark}
        hasFS={hasFS}
        hasDirOpen={hasDirOpen}
        onOpenFolder={handleRequestFolder}
        onOpenFile={openFile}
        onSave={handleSave}
        onToggleTheme={toggleTheme}
      />

      <div className="flex min-h-0 flex-1">
        {showSidebar && (
          <Sidebar
            dirName={dirHandle.name}
            files={files}
            activeFile={activeFile}
            onOpenFolder={handleRequestFolder}
            onOpenFile={openFileFromSidebar}
            onCreateFile={createFile}
            onDeleteFile={deleteFile}
          />
        )}

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="h-1/2 w-full md:h-full md:w-1/2">
            <Editor value={content} onChange={setContent} />
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <Separator orientation="horizontal" className="md:hidden" />
          <div className="h-1/2 w-full md:h-full md:w-1/2">
            <Preview content={content} />
          </div>
        </div>
      </div>

      {/* Help button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 size-9 rounded-full border border-border bg-background shadow-md"
        onClick={() => setShowHelp(true)}
        aria-label="Help"
      >
        <CircleHelp className="size-4" />
      </Button>

      <FolderPermissionDialog
        open={showPermissionDialog}
        onConfirm={handlePermissionConfirm}
        onCancel={() => setShowPermissionDialog(false)}
      />

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  )
}
