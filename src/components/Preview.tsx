import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

interface PreviewProps {
  content: string
}

export function Preview({ content }: PreviewProps) {
  const html = useMemo(() => {
    const raw = marked.parse(content) as string
    return DOMPurify.sanitize(raw)
  }, [content])

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none h-full w-full overflow-x-hidden overflow-y-auto p-4 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
