import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCursor } from '../cursor/CursorContext'

type Offset = {
  x: number
  y: number
}

type DepthCard = {
  id: string
  title: string
  subtitle: string
  accent: number
  texture: string
}

const CLAMP = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function DepthGallery() {
  const stackRef = useRef<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const { activateTarget, deactivateTarget, settings } = useCursor()

  const cards = useMemo<DepthCard[]>(
    () => [
      {
        id: 'depth-card-aurora',
        title: 'Aurora Trails',
        subtitle: 'Gradient echoes chase your pointer through the stack.',
        accent: 268,
        texture: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 60%)',
      },
      {
        id: 'depth-card-kinetic',
        title: 'Kinetic Layers',
        subtitle: 'Layers orbit with inertia for a holographic feel.',
        accent: 198,
        texture: 'linear-gradient(135deg, rgba(0,0,0,0.25), rgba(255,255,255,0.1))',
      },
      {
        id: 'depth-card-nebula',
        title: 'Nebula Drift',
        subtitle: 'A soft bloom that bends around your cursor.',
        accent: 322,
        texture: 'radial-gradient(circle at 70% 40%, rgba(255,255,255,0.2), transparent 55%)',
      },
    ],
    [],
  )

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = stackRef.current
    if (!element) return

    const bounds = element.getBoundingClientRect()
    const relativeX = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)
    const relativeY = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)

    setOffset({
      x: CLAMP(relativeX, -1, 1),
      y: CLAMP(relativeY, -1, 1),
    })
  }

  const handlePointerLeave = () => {
    setOffset({ x: 0, y: 0 })
    deactivateTarget('depth-gallery')
  }

  const depthStrength = settings.depthStrength
  const stackStyle: CSSProperties & Record<'--glow-x' | '--glow-y', string> = {
    '--glow-x': `${offset.x * 40 + 50}%`,
    '--glow-y': `${offset.y * -40 + 50}%`,
  }

  return (
    <section className="depth-gallery" aria-labelledby="depth-gallery-title">
      <div className="depth-gallery__header">
        <div>
          <p className="section-label">Immersive depth</p>
          <h2 id="depth-gallery-title">Layered parallax showcase</h2>
        </div>
        <p className="depth-gallery__hint">Sweep the stack to bend the cards in responsive 3D.</p>
      </div>
      <div
        ref={stackRef}
        className="depth-gallery__stack"
        style={stackStyle}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => activateTarget('depth-gallery', { variant: 'inspect' })}
        onPointerLeave={handlePointerLeave}
      >
        <div className="depth-gallery__halo" aria-hidden="true" />
        {cards.map((card, index) => {
          const weight = (index + 1) / cards.length
          const translateX = offset.x * depthStrength * 60 * weight
          const translateY = offset.y * depthStrength * 50 * weight
          const rotateX = offset.y * depthStrength * -12 * weight
          const rotateY = offset.x * depthStrength * 14 * weight
          const glowX = (offset.x * 50 + 50) * weight
          const glowY = (offset.y * -50 + 50) * weight

          const cardStyle: CSSProperties & Record<'--glow-x' | '--glow-y', string> = {
            '--glow-x': `${glowX}%`,
            '--glow-y': `${glowY}%`,
            transform: `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            zIndex: cards.length - index,
            background: `linear-gradient(145deg, hsla(${card.accent}, 82%, 62%, 0.88), hsla(${card.accent}, 92%, 52%, 0.72))`,
            boxShadow: `0 24px 48px -28px hsla(${card.accent}, 89%, 55%, 0.65)`
          }

          return (
            <figure
              key={card.id}
              className="depth-card"
              style={cardStyle}
            >
              <div className="depth-card__texture" style={{ backgroundImage: card.texture }} aria-hidden="true" />
              <figcaption>
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
