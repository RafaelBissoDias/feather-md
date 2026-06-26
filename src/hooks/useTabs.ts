import { useCallback, useRef, useState } from 'react'

export interface Tab {
  id: string
  title: string
  content: string
  isDirty: boolean
  fileHandle?: FileSystemFileHandle
}

const TABS_KEY = 'feathermd-tabs'
const ACTIVE_KEY = 'feathermd-active-tab'

export const DEFAULT_CONTENT = `# Welcome to FeatherMD

A lightweight Markdown editor with live preview.

## Features

- **Live preview** — see your markdown rendered in real time
- **Open & save** — work with \`.md\` files from your disk
- **PWA** — install it on your desktop from the browser
- **Dark/light mode** — toggle to your preference

## Example

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}!\`
console.log(greet('world'))
\`\`\`

---

Start writing your markdown on the left panel.
`

function genId() { return Math.random().toString(36).slice(2, 9) }

function readSaved(): Tab[] {
  try {
    const raw = localStorage.getItem(TABS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Tab[]
      if (Array.isArray(p) && p.length > 0) return p
    }
  } catch {}
  // Migrate from old single-content key
  const legacy = localStorage.getItem('feathermd-content')
  return [{ id: genId(), title: 'Untitled', content: legacy ?? DEFAULT_CONTENT, isDirty: false }]
}

function persist(tabs: Tab[]) {
  // fileHandle is not JSON-serializable — strip it
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs.map(({ fileHandle: _f, ...t }) => t)))
}

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>(readSaved)
  const [activeId, setActiveIdState] = useState<string>(() => {
    const saved = readSaved()
    const storedActive = localStorage.getItem(ACTIVE_KEY)
    return storedActive && saved.some(t => t.id === storedActive) ? storedActive : saved[0].id
  })

  const activeIdRef = useRef(activeId)
  activeIdRef.current = activeId

  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0]

  const setActive = useCallback((id: string) => {
    setActiveIdState(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }, [])

  const addTab = useCallback(() => {
    const tab: Tab = { id: genId(), title: 'Untitled', content: '', isDirty: false }
    setTabs(prev => { const n = [...prev, tab]; persist(n); return n })
    setActive(tab.id)
  }, [setActive])

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length <= 1) return prev
      const idx = prev.findIndex(t => t.id === id)
      const next = prev.filter(t => t.id !== id)
      persist(next)
      setActiveIdState(curr => {
        if (curr !== id) return curr
        const newId = next[Math.min(idx, next.length - 1)].id
        localStorage.setItem(ACTIVE_KEY, newId)
        return newId
      })
      return next
    })
  }, [])

  const switchTab = useCallback((id: string) => setActive(id), [setActive])

  const updateContent = useCallback((id: string, content: string) => {
    setTabs(prev => {
      const next = prev.map(t => t.id === id ? { ...t, content, isDirty: true } : t)
      persist(next)
      return next
    })
  }, [])

  const openFileAsTab = useCallback((name: string, content: string, handle?: FileSystemFileHandle) => {
    setTabs(prev => {
      // Already open → update + switch
      const existing = prev.find(t => t.title === name)
      if (existing) {
        const next = prev.map(t => t.id === existing.id ? { ...t, content, isDirty: false, fileHandle: handle } : t)
        persist(next)
        setActive(existing.id)
        return next
      }
      // Reuse current tab if Untitled and not dirty
      const curId = activeIdRef.current
      const cur = prev.find(t => t.id === curId)
      if (cur && cur.title === 'Untitled' && !cur.isDirty) {
        const next = prev.map(t => t.id === curId
          ? { ...t, title: name, content, isDirty: false, fileHandle: handle }
          : t)
        persist(next)
        return next
      }
      // New tab
      const tab: Tab = { id: genId(), title: name, content, isDirty: false, fileHandle: handle }
      const next = [...prev, tab]
      persist(next)
      setActive(tab.id)
      return next
    })
  }, [setActive])

  const markSaved = useCallback((id: string) => {
    setTabs(prev => { const n = prev.map(t => t.id === id ? { ...t, isDirty: false } : t); persist(n); return n })
  }, [])

  const renameTab = useCallback((id: string, title: string) => {
    if (!title.trim()) return
    setTabs(prev => { const n = prev.map(t => t.id === id ? { ...t, title: title.trim() } : t); persist(n); return n })
  }, [])

  return { tabs, activeId, activeTab, addTab, closeTab, switchTab, updateContent, openFileAsTab, markSaved, renameTab }
}
