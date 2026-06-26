import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, RangeSetBuilder } from '@codemirror/state'
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark'
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view'

export interface EditorHandle {
  readonly view: EditorView | null
}

interface EditorProps {
  content: string
  onChange: (value: string) => void
  isDark: boolean
  onCursorChange?: (line: number, col: number) => void
  onScroll?: (percent: number) => void
}

// --- Hashtag decoration ---
const hashtagMark = Decoration.mark({ class: 'cm-hashtag' })
const hashtagRe = /#(?![#\s])\S*/g

const hashtagPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) { this.decorations = buildHashtags(view) }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = buildHashtags(u.view)
    }
  },
  { decorations: (v) => v.decorations },
)

function buildHashtags(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.sliceDoc(from, to)
    hashtagRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = hashtagRe.exec(text)) !== null) {
      builder.add(from + m.index, from + m.index + m[0].length, hashtagMark)
    }
  }
  return builder.finish()
}

// --- Compartment for highlight style (dark / light) ---
const highlightComp = new Compartment()

// --- Base theme (only chrome — background comes from CSS vars) ---
const baseTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px', background: 'var(--background)', color: 'var(--foreground)' },
  '.cm-scroller': { fontFamily: 'var(--font-mono, ui-monospace, monospace)', overflow: 'auto', height: '100%' },
  '.cm-content': { padding: '16px', caretColor: 'var(--foreground, currentColor)' },
  '.cm-line': { padding: '0' },
  '&.cm-focused': { outline: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in oklab, var(--muted) 35%, transparent)' },
  '.cm-gutters': { background: 'var(--background)', borderRight: '1px solid var(--border)', color: 'var(--muted-foreground)' },
  '.cm-panels': { zIndex: '10', background: 'var(--card)', borderTop: '1px solid var(--border)' },
  '.cm-search': { fontSize: '13px', padding: '6px 8px' },
  '.cm-button': { background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' },
  '.cm-textfield': { background: 'var(--input, var(--background))', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', padding: '2px 6px' },
  // Hashtag pill
  '.cm-hashtag': {
    color: 'var(--primary)',
    backgroundColor: 'color-mix(in oklab, var(--primary) 15%, transparent)',
    borderRadius: '3px',
    padding: '1px 3px',
    fontWeight: '500',
  },
})

export const Editor = forwardRef<EditorHandle, EditorProps>(
  ({ content, onChange, isDark, onCursorChange, onScroll }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)

    const onChangeRef = useRef(onChange)
    const onCursorRef = useRef(onCursorChange)
    const onScrollRef = useRef(onScroll)
    onChangeRef.current = onChange
    onCursorRef.current = onCursorChange
    onScrollRef.current = onScroll

    useImperativeHandle(ref, () => ({ get view() { return viewRef.current } }))

    // Mount once
    useEffect(() => {
      if (!containerRef.current) return

      const view = new EditorView({
        state: EditorState.create({
          doc: content,
          extensions: [
            history(),
            drawSelection(),
            highlightActiveLine(),
            EditorView.lineWrapping,
            highlightComp.of(syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle)),
            keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            search({ top: true }),
            hashtagPlugin,
            baseTheme,

            EditorView.updateListener.of((update) => {
              if (update.docChanged) onChangeRef.current(update.state.doc.toString())
              if (update.selectionSet || update.docChanged) {
                const pos = update.state.selection.main.head
                const line = update.state.doc.lineAt(pos)
                onCursorRef.current?.(line.number, pos - line.from + 1)
              }
            }),

            EditorView.domEventHandlers({
              scroll: (_e, v) => {
                const s = v.scrollDOM
                const pct = s.scrollTop / (s.scrollHeight - s.clientHeight)
                onScrollRef.current?.(isNaN(pct) ? 0 : pct)
              },
              paste: (event, v) => {
                const items = event.clipboardData?.items
                if (!items) return
                for (const item of Array.from(items)) {
                  if (item.type.startsWith('image/')) {
                    event.preventDefault()
                    const file = item.getAsFile()
                    if (!file) break
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const url = e.target?.result as string
                      const { from } = v.state.selection.main
                      v.dispatch({ changes: { from, to: from, insert: `![pasted image](${url})\n` } })
                    }
                    reader.readAsDataURL(file)
                    break
                  }
                }
              },
            }),
          ],
        }),
        parent: containerRef.current,
      })

      viewRef.current = view
      return () => { view.destroy(); viewRef.current = null }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Sync external content
    useEffect(() => {
      const view = viewRef.current
      if (!view) return
      const cur = view.state.doc.toString()
      if (cur !== content) view.dispatch({ changes: { from: 0, to: cur.length, insert: content } })
    }, [content])

    // Sync highlight style on theme toggle
    useEffect(() => {
      viewRef.current?.dispatch({
        effects: highlightComp.reconfigure(
          syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle)
        ),
      })
    }, [isDark])

    return <div ref={containerRef} className="h-full w-full" aria-label="Markdown editor" />
  },
)
Editor.displayName = 'Editor'
