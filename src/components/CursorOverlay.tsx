import { useEffect, useRef } from 'react'
import { useCursor } from '../cursor/CursorContext'

export function CursorOverlay() {
  const {
    state: { x, y, visible, variant, isPointerDown },
    settings,
  } = useCursor()
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const cursorEl = cursorRef.current
    const innerEl = innerRef.current
    if (!cursorEl || !innerEl) return

    const frame = requestAnimationFrame(() => {
      cursorEl.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`)
      const targetScale = variant === 'press' || isPointerDown ? 0.75 : variant === 'drag' ? 1.25 : 1
      const scale = visible ? targetScale : 0.45
      innerEl.style.setProperty('transform', `scale(${scale})`)
    })

    return () => cancelAnimationFrame(frame)
  }, [x, y, variant, isPointerDown, visible])

  useEffect(() => {
    const cursorEl = cursorRef.current
    if (!cursorEl) return
    cursorEl.dataset.visible = visible ? 'true' : 'false'
    cursorEl.dataset.variant = variant
    cursorEl.dataset.spotlight = settings.spotlight ? 'true' : 'false'
    cursorEl.dataset.trails = settings.trails ? 'true' : 'false'
  }, [settings.spotlight, settings.trails, variant, visible])

  return (
    <div ref={cursorRef} className="cursor-overlay" aria-hidden="true">
      <div ref={innerRef} className="cursor-core">
        <span className="cursor-glow" />
        <span className="cursor-dot" />
      </div>
      {settings.trails && <div className="cursor-trail" />}
    </div>
  )
}
