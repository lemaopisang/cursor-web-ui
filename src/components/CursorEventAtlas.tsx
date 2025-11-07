import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCursor } from '../cursor/CursorContext'

type EventEffect =
  | 'echo'
  | 'magnet'
  | 'pulse'
  | 'vortex'
  | 'cascade'
  | 'shimmer'
  | 'warp'
  | 'flare'
  | 'orbit'
  | 'turbine'

type EventDescriptor = {
  id: string
  title: string
  tagline: string
  effect: EventEffect
  accent: number
  depth: number
}

type TileState = {
  offsetX: number
  offsetY: number
  angle: number
  intensity: number
  active: boolean
  pressed: boolean
}

const EFFECT_GROUPS: Array<{ effect: EventEffect; items: Array<Omit<EventDescriptor, 'id' | 'effect'>> }> = [
  {
    effect: 'echo',
    items: [
      { title: 'Echo Streak', tagline: 'Trailing photons chase your cursor path.', accent: 212, depth: 0.65 },
      { title: 'Aurora Tether', tagline: 'Northern lights arc toward pointer momentum.', accent: 188, depth: 0.72 },
      { title: 'Spectral Sweep', tagline: 'Chromatic blooms follow the velocity vector.', accent: 268, depth: 0.68 },
    ],
  },
  {
    effect: 'magnet',
    items: [
      { title: 'Magnet Grove', tagline: 'Nodes bend and snap toward hover focus.', accent: 152, depth: 0.6 },
      { title: 'Polarity Drift', tagline: 'Opposing poles light up across the plane.', accent: 8, depth: 0.66 },
      { title: 'Vector Loom', tagline: 'Directional warp emphasizes your heading.', accent: 38, depth: 0.58 },
    ],
  },
  {
    effect: 'pulse',
    items: [
      { title: 'Pulse Bloom', tagline: 'Radial bursts respond to pressure rhythms.', accent: 324, depth: 0.7 },
      { title: 'Fathom Rift', tagline: 'Concentric waves echo each drag impulse.', accent: 276, depth: 0.74 },
      { title: 'Chrono Ripple', tagline: 'Temporal rings dilate with speed spikes.', accent: 232, depth: 0.69 },
    ],
  },
  {
    effect: 'vortex',
    items: [
      { title: 'Gyro Vortex', tagline: 'Swirls pivot based on entry angle.', accent: 204, depth: 0.77 },
      { title: 'Spiral Bloom', tagline: 'Golden spirals tighten as you orbit.', accent: 48, depth: 0.82 },
      { title: 'Cyclone Loom', tagline: 'Vector energy folds into circular drift.', accent: 122, depth: 0.76 },
    ],
  },
  {
    effect: 'cascade',
    items: [
      { title: 'Cascade Veil', tagline: 'Falling light cascades toward pointer pull.', accent: 196, depth: 0.6 },
      { title: 'Prism Shower', tagline: 'Refracted beams align with pointer slope.', accent: 312, depth: 0.64 },
      { title: 'Glacier Slide', tagline: 'Cool streaks melt under cursor heat.', accent: 188, depth: 0.58 },
    ],
  },
  {
    effect: 'shimmer',
    items: [
      { title: 'Stellar Drift', tagline: 'Starfields shimmer with micro parallax.', accent: 268, depth: 0.72 },
      { title: 'Nebula Flare', tagline: 'Dust motes scatter with pointer swirl.', accent: 308, depth: 0.78 },
      { title: 'Lumen Flicker', tagline: 'Micro pulses flicker at hover cadence.', accent: 168, depth: 0.66 },
    ],
  },
  {
    effect: 'warp',
    items: [
      { title: 'Warp Lattice', tagline: 'Grid warps inward where velocity peaks.', accent: 48, depth: 0.7 },
      { title: 'Quantum Fold', tagline: 'Planar folds follow angular momentum.', accent: 182, depth: 0.68 },
      { title: 'Fabric Bend', tagline: 'Textile lines bend into ripple funnels.', accent: 10, depth: 0.72 },
    ],
  },
  {
    effect: 'flare',
    items: [
      { title: 'Ion Flare', tagline: 'Flares spike when you tap or press.', accent: 12, depth: 0.66 },
      { title: 'Solar Bloom', tagline: 'Radiant arcs ignite across the tile.', accent: 46, depth: 0.74 },
      { title: 'Radiant Pulse', tagline: 'Bloom waves echo with time-delayed fade.', accent: 322, depth: 0.7 },
    ],
  },
  {
    effect: 'orbit',
    items: [
      { title: 'Orbital Mesh', tagline: 'Miniature orbitals magnetize around center.', accent: 192, depth: 0.62 },
      { title: 'Satellite Run', tagline: 'Satellite beads race along nested paths.', accent: 260, depth: 0.68 },
      { title: 'Halo Drift', tagline: 'Halo arcs tilt with pointer angle.', accent: 118, depth: 0.64 },
    ],
  },
  {
    effect: 'turbine',
    items: [
      { title: 'Turbine Flux', tagline: 'Turbine fins accelerate with flux gain.', accent: 18, depth: 0.76 },
      { title: 'Vector Turbine', tagline: 'Directional fins align to heading.', accent: 206, depth: 0.72 },
      { title: 'Helix Spindle', tagline: 'Helical arms tighten on fast passes.', accent: 286, depth: 0.78 },
    ],
  },
]

const EVENT_DEFINITIONS: EventDescriptor[] = EFFECT_GROUPS.flatMap((group) =>
  group.items.map((item, index) => ({
    id: `${group.effect}-${index}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    effect: group.effect,
    title: item.title,
    tagline: item.tagline,
    accent: item.accent,
    depth: item.depth,
  })),
)

const INITIAL_TILE_STATE: TileState = {
  offsetX: 0,
  offsetY: 0,
  angle: 0,
  intensity: 0,
  active: false,
  pressed: false,
}

function EventTile({ descriptor }: { descriptor: EventDescriptor }) {
  const tileRef = useRef<HTMLDivElement | null>(null)
  const [tileState, setTileState] = useState<TileState>(INITIAL_TILE_STATE)
  const { state, activateTarget, deactivateTarget, setVariant } = useCursor()

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = tileRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    const relativeX = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)
    const relativeY = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)
    const clampedX = Math.max(-1, Math.min(1, relativeX))
    const clampedY = Math.max(-1, Math.min(1, relativeY))
    const distance = Math.min(1, Math.hypot(clampedX, clampedY))
    const angle = Math.atan2(clampedY, clampedX)

    setTileState((prev) => ({
      ...prev,
      offsetX: clampedX,
      offsetY: clampedY,
      angle,
      intensity: distance,
      active: true,
    }))
  }

  const handlePointerEnter = () => {
    activateTarget(descriptor.id, { variant: 'control' })
    setTileState((prev) => ({ ...prev, active: true }))
  }

  const handlePointerLeave = () => {
    deactivateTarget(descriptor.id)
    setVariant('default')
    setTileState(INITIAL_TILE_STATE)
  }

  const handlePointerDown = () => {
    setVariant('press')
    setTileState((prev) => ({ ...prev, pressed: true }))
  }

  const handlePointerUp = () => {
    setVariant('default')
    setTileState((prev) => ({ ...prev, pressed: false }))
  }

  const velocity = Math.min(Math.hypot(state.vx, state.vy) * 320, 1.6)
  const angleDeg = (tileState.angle * 180) / Math.PI

  const tileStyle: CSSProperties &
    Record<
      | '--event-offset-x'
      | '--event-offset-y'
      | '--event-angle'
      | '--event-intensity'
      | '--event-hue'
      | '--event-velocity'
      | '--event-depth',
      string
    > = {
    '--event-offset-x': `${tileState.offsetX}`,
    '--event-offset-y': `${tileState.offsetY}`,
    '--event-angle': `${angleDeg}`,
    '--event-intensity': `${tileState.intensity}`,
    '--event-hue': `${descriptor.accent}`,
    '--event-velocity': `${velocity}`,
    '--event-depth': `${descriptor.depth}`,
  }

  return (
    <article
      ref={tileRef}
      className={`event-tile event-effect-${descriptor.effect}`}
      style={tileStyle}
      data-active={tileState.active}
      data-pressed={tileState.pressed}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="event-tile__background" aria-hidden="true" />
      <div className="event-tile__overlay" aria-hidden="true" />
      <div className="event-tile__ripple" aria-hidden="true" />
      <header className="event-tile__header">
        <p className="event-tile__tagline">{descriptor.tagline}</p>
        <h3 className="event-tile__title">{descriptor.title}</h3>
      </header>
      <footer className="event-tile__metrics" aria-hidden="true">
        <span>
          Velocity: <strong>{Math.round(velocity * 100)}</strong>
        </span>
        <span>
          Angle: <strong>{Number.isFinite(angleDeg) ? Math.round(angleDeg) : 0}°</strong>
        </span>
        <span>
          Distance: <strong>{Math.round(tileState.intensity * 100)}%</strong>
        </span>
      </footer>
    </article>
  )
}

export function CursorEventAtlas() {
  const events = useMemo(() => EVENT_DEFINITIONS, [])

  return (
    <section className="cursor-event-atlas" aria-labelledby="cursor-event-atlas-title">
      <div className="cursor-event-atlas__intro">
        <div>
          <p className="section-label">30 experimental modes</p>
          <h2 id="cursor-event-atlas-title">Cursor event atlas</h2>
        </div>
        <p className="section-subtitle">
          Hover any tile to trigger bespoke micro-interactions collected from motion-centric design systems. Velocity,
          angle, and distance drive layered visual responses.
        </p>
      </div>
      <div className="cursor-event-atlas__grid">
        {events.map((event) => (
          <EventTile key={event.id} descriptor={event} />
        ))}
      </div>
    </section>
  )
}
