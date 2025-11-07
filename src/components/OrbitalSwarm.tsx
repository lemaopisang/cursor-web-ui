import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCursor } from '../cursor/CursorContext'

type OrbitConfig = {
  id: string
  radius: number
  size: number
  hue: number
  speed: number
  trail: number
}

type SwarmState = {
  x: number
  y: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function OrbitalSwarm() {
  const wellRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState<SwarmState>({ x: 0, y: 0 })
  const { state, settings, activateTarget, deactivateTarget } = useCursor()

  const orbits = useMemo<OrbitConfig[]>(
    () => [
      { id: 'polar-arc', radius: 56, size: 10, hue: 198, speed: 18, trail: 36 },
      { id: 'zenith-band', radius: 92, size: 12, hue: 272, speed: 24, trail: 52 },
      { id: 'equator-loop', radius: 132, size: 9, hue: 162, speed: 32, trail: 68 },
      { id: 'apogee-stream', radius: 176, size: 14, hue: 48, speed: 45, trail: 84 },
      { id: 'perigee-ray', radius: 216, size: 11, hue: 12, speed: 58, trail: 96 },
    ],
    [],
  )

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = wellRef.current
    if (!element) return

    const bounds = element.getBoundingClientRect()
    const ratioX = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)
    const ratioY = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)
    setTilt({
      x: clamp(ratioX, -1, 1),
      y: clamp(ratioY, -1, 1),
    })
  }

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 })
    deactivateTarget('orbital-swarm')
  }

  const velocity = Math.min(Math.hypot(state.vx, state.vy) * 180, 1.2)
  const flux = clamp(settings.fluxIntensity, 0, 1)
  const energy = clamp(velocity * (0.6 + flux * 0.9), 0, 1.4)

  const wellStyle: CSSProperties & Record<'--swarm-tilt-x' | '--swarm-tilt-y' | '--swarm-energy', string> = {
    '--swarm-tilt-x': `${tilt.y * -16}deg`,
    '--swarm-tilt-y': `${tilt.x * 16}deg`,
    '--swarm-energy': `${energy}`,
  }

  return (
    <section className="orbital-swarm" aria-labelledby="orbital-swarm-title">
      <header>
        <p className="section-label">Flux choreography</p>
        <h2 id="orbital-swarm-title">Orbital swarm playground</h2>
        <p className="section-subtitle">
          Drift through the plasma well to accelerate satellites and bend their ribbons around your path.
        </p>
      </header>
      <div
        ref={wellRef}
        className="orbital-swarm__well"
        style={wellStyle}
        onPointerEnter={() => activateTarget('orbital-swarm', { variant: 'inspect' })}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        <div className="orbital-swarm__backdrop" aria-hidden="true" />
        <div className="orbital-swarm__core" aria-hidden="true" />
        {orbits.map((orbit, index) => {
          const radius = orbit.radius + energy * 18
          const orbitStyle: CSSProperties & Record<'--orbit-radius' | '--orbit-diameter' | '--orbit-speed' | '--orbit-trail', string> = {
            '--orbit-radius': `${radius}px`,
            '--orbit-diameter': `${radius * 2}px`,
            '--orbit-speed': `${Math.max(8, orbit.speed - energy * 12)}s`,
            '--orbit-trail': `${orbit.trail + energy * 12}px`,
          }
          const satelliteStyle: CSSProperties = {
            width: `${orbit.size + energy * 2}px`,
            height: `${orbit.size + energy * 2}px`,
            background: `radial-gradient(circle, hsla(${orbit.hue}, 100%, ${70 - index * 4}%, 0.95), hsla(${orbit.hue}, 90%, 55%, 0.35))`,
            boxShadow: `0 0 ${18 + energy * 22}px hsla(${orbit.hue}, 90%, 65%, ${0.45 + energy * 0.3})`,
            opacity: clamp(0.7 + energy * 0.2, 0, 1),
          }

          return (
            <div key={orbit.id} className="orbit-ring" style={orbitStyle}>
              <span className="orbit-satellite" style={satelliteStyle} />
            </div>
          )
        })}
        <div className="orbital-swarm__halo" aria-hidden="true" />
      </div>
      <ul className="orbital-swarm__legend">
        <li>
          <strong>Flux gain:</strong> Velocity spikes amplify orbit radii and glow.
        </li>
        <li>
          <strong>Swarm tilt:</strong> Pointer angle leans the entire well in 3D.
        </li>
        <li>
          <strong>Trail ribbons:</strong> Flux intensity adjusts the ribbon sweep length.
        </li>
      </ul>
    </section>
  )
}
