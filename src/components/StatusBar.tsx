import { useMemo } from 'react'

interface StatusBarProps {
  content: string
  cursorLine: number
  cursorCol: number
}

export function StatusBar({ content, cursorLine, cursorCol }: StatusBarProps) {
  const stats = useMemo(() => {
    const chars = content.length
    const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
    const lines = content.split('\n').length
    return { chars, words, lines }
  }, [content])

  return (
    <footer
      data-no-print
      className="flex items-center justify-between border-t border-border px-4 py-1 text-xs text-muted-foreground"
    >
      <div className="flex items-center gap-4">
        <span>{stats.words.toLocaleString()} words</span>
        <span>{stats.chars.toLocaleString()} chars</span>
        <span>{stats.lines.toLocaleString()} lines</span>
      </div>
      <span>Ln {cursorLine}, Col {cursorCol}</span>
    </footer>
  )
}
