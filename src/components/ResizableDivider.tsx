import { useRef } from 'react'

interface ResizableDividerProps {
  onResize: (deltaX: number) => void
}

export function ResizableDivider({ onResize }: ResizableDividerProps) {
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    lastX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    onResize(e.clientX - lastX.current)
    lastX.current = e.clientX
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  return (
    <div
      data-no-print
      className="group relative hidden w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary/60 active:bg-primary md:block"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-hidden="true"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  )
}
