interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  return (
    <textarea
      className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing markdown..."
      spellCheck={false}
      aria-label="Markdown editor"
    />
  )
}
