import { useCallback, useState } from 'react'

export interface FSFile {
  name: string
  handle: FileSystemFileHandle
}

export function useFileSystem(
  content: string,
  onContentChange: (content: string) => void,
) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [files, setFiles] = useState<FSFile[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)

  const refreshFiles = useCallback(async (dir: FileSystemDirectoryHandle) => {
    const entries: FSFile[] = []
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind === 'file' && /\.(md|txt)$/i.test(name)) {
        entries.push({ name, handle: handle as FileSystemFileHandle })
      }
    }
    entries.sort((a, b) => a.name.localeCompare(b.name))
    setFiles(entries)
  }, [])

  const openFolder = useCallback(async () => {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' })
      setDirHandle(dir)
      setActiveFile(null)
      await refreshFiles(dir)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('openFolder failed:', e)
      }
    }
  }, [refreshFiles])

  const openFileFromSidebar = useCallback(async (file: FSFile) => {
    const f = await file.handle.getFile()
    const text = await f.text()
    onContentChange(text)
    setActiveFile(file.name)
  }, [onContentChange])

  const saveActiveFile = useCallback(async (): Promise<boolean> => {
    if (!dirHandle || !activeFile) return false
    try {
      const fileHandle = await dirHandle.getFileHandle(activeFile)
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      return true
    } catch {
      return false
    }
  }, [dirHandle, activeFile, content])

  const createFile = useCallback(async (name: string) => {
    if (!dirHandle) return
    const fileName = name.endsWith('.md') || name.endsWith('.txt') ? name : `${name}.md`
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write('')
      await writable.close()
      onContentChange('')
      setActiveFile(fileName)
      await refreshFiles(dirHandle)
    } catch (e) {
      console.error('Failed to create file:', e)
    }
  }, [dirHandle, onContentChange, refreshFiles])

  const deleteFile = useCallback(async (name: string) => {
    if (!dirHandle) return
    try {
      await dirHandle.removeEntry(name)
      if (activeFile === name) {
        setActiveFile(null)
        onContentChange('')
      }
      await refreshFiles(dirHandle)
    } catch (e) {
      console.error('Failed to delete file:', e)
    }
  }, [dirHandle, activeFile, onContentChange, refreshFiles])

  return {
    dirHandle,
    files,
    activeFile,
    openFolder,
    openFileFromSidebar,
    saveActiveFile,
    createFile,
    deleteFile,
  }
}
