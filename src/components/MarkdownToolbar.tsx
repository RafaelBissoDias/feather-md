import type { RefObject } from 'react'
import {
  Bold, Code, Heading1, Heading2, Heading3,
  Image, Italic, Link, List, ListOrdered,
  Minus, Quote, Strikethrough,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { EditorHandle } from './Editor'

interface MarkdownToolbarProps {
  editorRef: RefObject<EditorHandle | null>
}

function insert(ref: RefObject<EditorHandle | null>, before: string, after = '', placeholder = '') {
  const view = ref.current?.view
  if (!view) return
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to) || placeholder
  view.dispatch({
    changes: { from, to, insert: before + selected + after },
    selection: { anchor: from + before.length, head: from + before.length + selected.length },
  })
  view.focus()
}

function insertLine(ref: RefObject<EditorHandle | null>, prefix: string) {
  const view = ref.current?.view
  if (!view) return
  const { from } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  view.dispatch({
    changes: { from: line.from, to: line.from, insert: prefix },
    selection: { anchor: from + prefix.length },
  })
  view.focus()
}

interface Btn { label: string; icon: React.ReactNode; action: () => void }

export function MarkdownToolbar({ editorRef }: MarkdownToolbarProps) {
  const i = (b: string, a = '', p = '') => insert(editorRef, b, a, p)
  const l = (p: string) => insertLine(editorRef, p)

  const groups: Btn[][] = [
    [
      { label: 'Heading 1', icon: <Heading1 className="size-3.5" />, action: () => l('# ') },
      { label: 'Heading 2', icon: <Heading2 className="size-3.5" />, action: () => l('## ') },
      { label: 'Heading 3', icon: <Heading3 className="size-3.5" />, action: () => l('### ') },
    ],
    [
      { label: 'Bold', icon: <Bold className="size-3.5" />, action: () => i('**', '**', 'bold') },
      { label: 'Italic', icon: <Italic className="size-3.5" />, action: () => i('*', '*', 'italic') },
      { label: 'Strikethrough', icon: <Strikethrough className="size-3.5" />, action: () => i('~~', '~~', 'text') },
    ],
    [
      { label: 'Inline code', icon: <Code className="size-3.5" />, action: () => i('`', '`', 'code') },
      { label: 'Code block', icon: <span className="font-mono text-[10px] leading-none">{'</>'}</span>, action: () => i('```\n', '\n```', 'code') },
      { label: 'Blockquote', icon: <Quote className="size-3.5" />, action: () => l('> ') },
    ],
    [
      { label: 'Link', icon: <Link className="size-3.5" />, action: () => i('[', '](url)', 'text') },
      { label: 'Image', icon: <Image className="size-3.5" />, action: () => i('![', '](url)', 'alt') },
    ],
    [
      { label: 'Unordered list', icon: <List className="size-3.5" />, action: () => l('- ') },
      { label: 'Ordered list', icon: <ListOrdered className="size-3.5" />, action: () => l('1. ') },
      { label: 'Horizontal rule', icon: <Minus className="size-3.5" />, action: () => i('\n---\n') },
    ],
  ]

  return (
    <div
      data-no-print
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/10 px-2 py-1"
    >
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center">
          {gi > 0 && <Separator orientation="vertical" className="mx-1 h-4" />}
          {group.map((btn) => (
            <Tooltip key={btn.label}>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={btn.action}
                  aria-label={btn.label}
                  tabIndex={-1}
                >
                  {btn.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{btn.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  )
}
