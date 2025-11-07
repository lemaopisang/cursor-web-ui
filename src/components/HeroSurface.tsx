import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useCursor } from '../cursor/CursorContext'

type Offset = { x: number; y: number }

export function HeroSurface() {
  const containerRef = useRef<HTMLElement | null>(null)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const {
    activateTarget,
    deactivateTarget,
    settings: { parallaxIntensity },
  } = useCursor()

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds) return
    const relativeX = event.clientX - bounds.left
    const relativeY = event.clientY - bounds.top
    const centerX = bounds.width / 2
    const centerY = bounds.height / 2
    const intensity = parallaxIntensity / 100

    const nextOffset = {
      x: (relativeX - centerX) * intensity,
      y: (relativeY - centerY) * intensity,
    }
    setOffset(nextOffset)
  }

  const heroStyle = useMemo(
    () => ({
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    }),
    [offset],
  )

  return (
    <section
      ref={containerRef}
      className="hero-surface"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        activateTarget('hero', { variant: 'inspect' })
      }}
      onPointerLeave={() => {
        setOffset({ x: 0, y: 0 })
        deactivateTarget('hero')
      }}
    >
      <div className="hero-gradient" />
      <div className="hero-content" style={heroStyle}>
        <p className="hero-eyebrow">Ultra Interactive Playground</p>
        <h1>Cursor Event Universe</h1>
        <p className="hero-body">
          Every pixel is alive. Chase the glow, drag the atmosphere, and watch the UI
          bend to your orbit.
        </p>
      </div>
    </section>
  )
}
