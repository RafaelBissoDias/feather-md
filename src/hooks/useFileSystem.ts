import { useCallback, useState } from 'react'

export interface FSFile {
  name: string
  handle: FileSystemFileHandle
}

export function useFileSystem(
  openFileAsTab: (name: string, content: string, handle: FileSystemFileHandle) => void,
) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [files, setFiles] = useState<FSFile[]>([])

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
      await refreshFiles(dir)
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') console.error('openFolder failed:', e)
    }
  }, [refreshFiles])

  const openFileFromSidebar = useCallback(async (file: FSFile) => {
    const f = await file.handle.getFile()
    const text = await f.text()
    openFileAsTab(file.name, text, file.handle)
  }, [openFileAsTab])

  const saveToHandle = useCallback(async (handle: FileSystemFileHandle, content: string): Promise<boolean> => {
    try {
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
      return true
    } catch { return false }
  }, [])

  const createFile = useCallback(async (name: string) => {
    if (!dirHandle) return
    const fileName = name.endsWith('.md') || name.endsWith('.txt') ? name : `${name}.md`
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write('')
      await writable.close()
      openFileAsTab(fileName, '', fileHandle)
      await refreshFiles(dirHandle)
    } catch (e) { console.error('Failed to create file:', e) }
  }, [dirHandle, openFileAsTab, refreshFiles])

  const deleteFile = useCallback(async (name: string) => {
    if (!dirHandle) return
    try {
      await dirHandle.removeEntry(name)
      await refreshFiles(dirHandle)
    } catch (e) { console.error('Failed to delete file:', e) }
  }, [dirHandle, refreshFiles])

  return { dirHandle, files, openFolder, openFileFromSidebar, saveToHandle, createFile, deleteFile }
}
