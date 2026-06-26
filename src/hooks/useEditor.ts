import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'feathermd-content'
const THEME_KEY = 'feathermd-theme'

const DEFAULT_CONTENT = `# Welcome to FeatherMD

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

export function useEditor() {
  const [content, setContent] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CONTENT,
  )
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem(THEME_KEY) !== 'light',
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content)
  }, [content])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), [])

  const openFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result
        if (typeof text === 'string') setContent(text)
      }
      reader.readAsText(file, 'utf-8')
      e.target.value = ''
    },
    [],
  )

  const saveFile = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [content])

  return {
    content,
    setContent,
    isDark,
    toggleTheme,
    openFile,
    saveFile,
    fileInputRef,
    handleFileChange,
  }
}
