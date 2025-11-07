import {
  useMemo,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useCursor } from '../cursor/CursorContext'

type GridItem = {
  id: string
  title: string
  description: string
  hue: number
}

const GRID_ITEMS: GridItem[] = [
  {
    id: 'gravity-wells',
    title: 'Gravity Wells',
    description: 'Elements lean toward your pointer with elastic resistance.',
    hue: 210,
  },
  {
    id: 'signal-pulse',
    title: 'Signal Pulse',
    description: 'Cursor proximity sends ripples throughout the card network.',
    hue: 320,
  },
  {
    id: 'particle-orbit',
    title: 'Particle Orbit',
    description: 'Micro orbiters trail your path and accelerate on clicks.',
    hue: 120,
  },
  {
    id: 'data-flow',
    title: 'Data Flow',
    description: 'Visualize velocity vectors extracted from the pointer stream.',
    hue: 45,
  },
]

export function InteractiveGrid() {
  const { activateTarget, deactivateTarget, settings } = useCursor()

  const cards = useMemo(() => GRID_ITEMS, [])

  const handlePointerEnter = (id: string) => {
    activateTarget(id, { variant: 'link' })
  }

  const handlePointerLeave = (id: string) => {
    deactivateTarget(id)
    deactivateTarget(`${id}-detail`)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    const element = event.currentTarget
    const bounds = element.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const centerX = bounds.width / 2
    const centerY = bounds.height / 2

    if (settings.magnetic) {
      const rotateX = ((y - centerY) / centerY) * -8
      const rotateY = ((x - centerX) / centerX) * 8
      const glowX = ((x - centerX) / centerX) * 50
      const glowY = ((y - centerY) / centerY) * 50

      element.style.setProperty('--card-rotate-x', `${rotateX}deg`)
      element.style.setProperty('--card-rotate-y', `${rotateY}deg`)
      element.style.setProperty('--card-glow-x', `${glowX}px`)
      element.style.setProperty('--card-glow-y', `${glowY}px`)
      element.dataset.active = 'true'
    } else {
      element.style.removeProperty('--card-rotate-x')
      element.style.removeProperty('--card-rotate-y')
      element.style.removeProperty('--card-glow-x')
      element.style.removeProperty('--card-glow-y')
      element.dataset.active = 'true'
    }

    activateTarget(`${id}-detail`)
  }

  return (
    <section className="interactive-grid">
      <header>
        <h2>Interaction Lab</h2>
        <p>Touch any card — it will rotate, glow, and whisper telemetry back to the cursor.</p>
      </header>
      <div className="grid">
        {cards.map((item) => (
          <div
            key={item.id}
            className="grid-card"
            style={{
              '--card-hue': item.hue,
            } as CSSProperties}
            onPointerEnter={() => handlePointerEnter(item.id)}
            onPointerLeave={(event) => {
              handlePointerLeave(item.id)
              event.currentTarget.style.removeProperty('--card-rotate-x')
              event.currentTarget.style.removeProperty('--card-rotate-y')
              event.currentTarget.style.removeProperty('--card-glow-x')
              event.currentTarget.style.removeProperty('--card-glow-y')
              event.currentTarget.dataset.active = 'false'
              event.currentTarget.style.removeProperty('transform')
            }}
            onPointerMove={(event) => handlePointerMove(event, item.id)}
          >
            <div className="card-glow" />
            <div className="card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="card-tag">#{item.id}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
