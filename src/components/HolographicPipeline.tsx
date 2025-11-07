import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCursor } from '../cursor/CursorContext'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type PipelineStage = {
  id: string
  title: string
  description: string
  weight: number
}

const STAGES: PipelineStage[] = [
  {
    id: 'capture',
    title: 'Signal capture',
    description: 'Raw pointer telemetry is sampled at high frequency and smoothed with adaptive inertia.',
    weight: 0.92,
  },
  {
    id: 'amplify',
    title: 'Amplitude shaping',
    description: 'Velocity envelopes and drag curves sculpt the cursor stream into usable energy.',
    weight: 0.78,
  },
  {
    id: 'modulate',
    title: 'Phase modulation',
    description: 'Oscillation depth injects harmonic sway that downstream layers can phase-lock to.',
    weight: 0.66,
  },
  {
    id: 'project',
    title: 'Surface projection',
    description: 'Projection shaders bend gradients and particles in sync with the oscillation carrier.',
    weight: 0.74,
  },
  {
    id: 'render',
    title: 'Holographic render',
    description: 'The scene composites parallax, swarm, and atlas textures into a single responsive output.',
    weight: 0.88,
  },
]

export function HolographicPipeline() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [cursorRatio, setCursorRatio] = useState({ x: 0.5, y: 0.5 })
  const { state, settings, activateTarget, deactivateTarget } = useCursor()

  const throughput = clamp(state.speed * (420 + settings.fluxIntensity * 180), 0, 2)
  const harmony = clamp(Math.abs(state.oscillation) * 1.8 + settings.oscillationDepth, 0, 1.5)
  const polarity = clamp(Math.abs(state.smoothedVx) * 140 + (settings.magnetic ? 0.25 : 0.05), 0.05, 1.3)

  const pipelineStyle: CSSProperties &
    Record<'--pipeline-throughput' | '--pipeline-harmony' | '--pipeline-tilt-x' | '--pipeline-tilt-y', string> = {
    '--pipeline-throughput': `${throughput}`,
    '--pipeline-harmony': `${harmony}`,
    '--pipeline-tilt-x': `${(cursorRatio.x - 0.5) * 18}deg`,
    '--pipeline-tilt-y': `${(0.5 - cursorRatio.y) * 18}deg`,
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = stageRef.current
    if (!element) return
    const { left, top, width, height } = element.getBoundingClientRect()
    setCursorRatio({
      x: clamp((event.clientX - left) / width, 0, 1),
      y: clamp((event.clientY - top) / height, 0, 1),
    })
  }

  const stages = useMemo(() => STAGES, [])

  return (
    <section className="holographic-pipeline" aria-labelledby="holographic-pipeline-title">
      <header>
        <p className="section-label">Process topology</p>
        <h2 id="holographic-pipeline-title">Holographic cursor pipeline</h2>
        <p className="section-subtitle">
          Surf the pipeline to see how inertia, drag, and oscillation feed layered visuals. Each stage lights up with
          throughput and harmony.
        </p>
      </header>
      <div
        ref={stageRef}
        className="pipeline-surface"
        style={pipelineStyle}
        onPointerEnter={() => activateTarget('holographic-pipeline', { variant: 'inspect' })}
        onPointerLeave={() => {
          deactivateTarget('holographic-pipeline')
          setCursorRatio({ x: 0.5, y: 0.5 })
        }}
        onPointerMove={handlePointerMove}
      >
        <div className="pipeline-backdrop" aria-hidden="true" />
        <div className="pipeline-grid" aria-hidden="true" />
        {stages.map((stage, index) => {
          const weight = stage.weight
          const oscillation = Math.sin((cursorRatio.x + index * 0.27) * Math.PI * 2) * harmony
          const intensity = clamp(weight * (0.6 + throughput * 0.2) + oscillation * 0.25, 0, 1.6)
          const delay = index * 80

          const stageStyle: CSSProperties &
            Record<'--stage-intensity' | '--stage-delay' | '--stage-index' | '--stage-polarity', string> = {
            '--stage-intensity': `${intensity}`,
            '--stage-delay': `${delay}ms`,
            '--stage-index': `${index}`,
            '--stage-polarity': `${polarity}`,
          }

          return (
            <article key={stage.id} className="pipeline-stage" style={stageStyle}>
              <div className="pipeline-stage__halo" aria-hidden="true" />
              <div className="pipeline-stage__header">
                <span className="pipeline-stage__index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{stage.title}</h3>
              </div>
              <p>{stage.description}</p>
              <footer className="pipeline-stage__metrics">
                <span>Gain {Math.round(intensity * 62)}%</span>
                <span>Phase {Math.round((oscillation + 1) * 90)}°</span>
                <span>Polarity {Math.round(polarity * 60)}%</span>
              </footer>
            </article>
          )
        })}
      </div>
    </section>
  )
}
