import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'feathermd-theme'

export function useEditor() {
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem(THEME_KEY) !== 'light')

  useEffect(() => {
    const root = document.documentElement
    if (isDark) { root.classList.add('dark'); localStorage.setItem(THEME_KEY, 'dark') }
    else { root.classList.remove('dark'); localStorage.setItem(THEME_KEY, 'light') }
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark(p => !p), [])

  const downloadFile = useCallback((title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = title.endsWith('.md') || title.endsWith('.txt') ? title : `${title}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return { isDark, toggleTheme, downloadFile }
}
