import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useCursor } from '../cursor/CursorContext'

const SAMPLE_COUNT = 64
const DECAY = 0.92

export function VelocityWave() {
  const {
    state: { vx, vy },
    activateTarget,
    deactivateTarget,
  } = useCursor()
  const [samples, setSamples] = useState<number[]>(() => new Array(SAMPLE_COUNT).fill(0))
  const frameRef = useRef<number | null>(null)

  const magnitude = useMemo(() => Math.hypot(vx, vy), [vx, vy])

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }
    frameRef.current = requestAnimationFrame(() => {
      setSamples((prev) => {
        const next = prev.slice(1)
        const scaled = Math.min(1, magnitude * 120)
        next.push(scaled)
        return next
      })
    })

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [magnitude])

  const smoothedPeak = useMemo(() => {
    return samples.reduce((acc, value) => Math.max(acc * DECAY, value), 0)
  }, [samples])

  return (
    <section
      className="velocity-wave"
      onPointerEnter={() => activateTarget('velocity-wave', { variant: 'inspect' })}
      onPointerLeave={() => deactivateTarget('velocity-wave')}
    >
      <header>
        <h2>Velocity Wave</h2>
        <p>Real-time snapshot of cursor momentum. Faster motion pushes the crest higher.</p>
      </header>
      <div className="wave-graph" style={{ '--wave-peak': smoothedPeak } as CSSProperties}>
        {samples.map((value, index) => (
          <span key={index} className="wave-bar" style={{ '--wave-value': value } as CSSProperties} />
        ))}
      </div>
    </section>
  )
}
