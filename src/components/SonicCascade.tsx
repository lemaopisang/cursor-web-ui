import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useCursor } from '../cursor/CursorContext'

const BANDS = 28
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type Band = {
  id: number
  value: number
  ripple: number
}

export function SonicCascade() {
  const { state, settings, activateTarget, deactivateTarget } = useCursor()
  const stateRef = useRef(state)
  const [bands, setBands] = useState<Band[]>(() =>
    Array.from({ length: BANDS }, (_, index) => ({ id: index, value: 0, ripple: 0 })),
  )
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const tick = () => {
      const snapshot = stateRef.current
      const base = clamp(snapshot.speed * 380 + Math.abs(snapshot.oscillation) * 240, 0, 1.85)
      const ripple = clamp(settings.oscillationDepth * 1.2 + snapshot.oscillation * 0.8, -1, 1)
      const inertia = clamp(settings.inertiaIntensity, 0, 0.95)

      setBands((prev) => {
        const next = prev.map((band, index) => {
          const falloff = 1 - index / BANDS
          const eased = base * falloff
          const newValue = band.value * (0.68 + inertia * 0.25) + eased * (0.32 - inertia * 0.2)
          const rippleValue = band.ripple * 0.82 + ripple * 0.5
          return {
            id: band.id,
            value: clamp(newValue, 0, 2),
            ripple: clamp(rippleValue, -1, 1),
          }
        })
        next.push({
          id: prev.length,
          value: clamp(base * 0.9, 0, 2),
          ripple: clamp(ripple, -1, 1),
        })
        next.shift()
        return next.map((band, index) => ({ ...band, id: index }))
      })

      animationRef.current = window.requestAnimationFrame(tick)
    }

    animationRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [settings.inertiaIntensity, settings.oscillationDepth])

  const bandSlices = useMemo(() => bands, [bands])
  const maxValue = bandSlices.reduce((acc, item) => Math.max(acc, item.value), 0)

  return (
    <section className="sonic-cascade" aria-labelledby="sonic-cascade-title">
      <header>
        <p className="section-label">Audio-inspired motion</p>
        <h2 id="sonic-cascade-title">Sonic cascade visualizer</h2>
        <p className="section-subtitle">
          Cursor velocity fuels a spectral cascade. Drag further to spike gain, or roll gently to watch ripple phases
          settle.
        </p>
      </header>
      <div
        className="cascade-spectrum"
        onPointerEnter={() => activateTarget('sonic-cascade', { variant: 'inspect' })}
        onPointerLeave={() => deactivateTarget('sonic-cascade')}
        data-active={state.visible}
      >
        <div className="cascade-baseline" aria-hidden="true" />
        {bandSlices.map((band) => {
          const normalized = maxValue > 0 ? band.value / maxValue : 0
          const style: CSSProperties & Record<'--band-value' | '--band-ripple', string> = {
            '--band-value': `${normalized}`,
            '--band-ripple': `${band.ripple}`,
          }
          return <span key={band.id} className="cascade-band" style={style} aria-hidden="true" />
        })}
      </div>
    </section>
  )
}
