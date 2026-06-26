import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

marked.use({ breaks: true, gfm: true })
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language: validLang }).value
    },
  }),
)

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
