import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { useCursor } from '../cursor/CursorContext'

type TimelineEvent = {
  id: string
  label: string
  detail: string
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'capture',
    label: 'Pointer capture',
    detail: 'Velocity stream spikes to 1.2x baseline. Trail amplifies.',
  },
  {
    id: 'hover-loop',
    label: 'Hover loop',
    detail: 'Spotlight locks onto card cluster with phase shift.',
  },
  {
    id: 'burst',
    label: 'Burst trigger',
    detail: 'Click detected — ring compresses and rebounds.',
  },
  {
    id: 'drift',
    label: 'Inertia drift',
    detail: 'Magnetic fallback eases pointer from edge friction.',
  },
  {
    id: 'return',
    label: 'Return to origin',
    detail: 'Cursor recenters, glow decays gracefully.',
  },
]

export function TimelineStrip() {
  const { activateTarget, deactivateTarget, state } = useCursor()
  const stripRef = useRef<HTMLDivElement | null>(null)
  const events = useMemo(() => TIMELINE_EVENTS, [])

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const strip = stripRef.current
    if (!strip) return

    const bounds = strip.getBoundingClientRect()
    const relativeX = event.clientX - bounds.left
    const scrollRatio = relativeX / bounds.width
    const nextScroll = scrollRatio * (strip.scrollWidth - bounds.width)
    strip.style.setProperty('--cursor-local-x', `${relativeX}px`)
    strip.scrollTo({ left: nextScroll, behavior: 'auto' })
  }

  return (
    <section className="timeline-strip">
      <header>
        <h2>Telemetry Timeline</h2>
        <p>Skim the event log — the ribbon scrolls with your pointer velocity.</p>
      </header>
      <div
        ref={stripRef}
        className="timeline-ribbon"
        onPointerEnter={() => activateTarget('timeline', { variant: 'drag' })}
        onPointerLeave={() => {
          stripRef.current?.style.removeProperty('--cursor-local-x')
          deactivateTarget('timeline')
        }}
        onPointerMove={handlePointerMove}
      >
        {events.map((item) => (
          <article
            key={item.id}
            className="timeline-card"
            data-active={state.activeTarget === item.id}
            onPointerEnter={() => activateTarget(item.id)}
            onPointerLeave={() => {
              deactivateTarget(item.id)
              activateTarget('timeline', { variant: 'drag' })
            }}
          >
            <h3>{item.label}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
