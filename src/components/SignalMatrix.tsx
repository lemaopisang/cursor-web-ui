import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCursor } from '../cursor/CursorContext'

type MatrixCell = {
  id: string
  row: number
  col: number
}

type PointerMatrix = {
  x: number
  y: number
}

const ROWS = 4
const COLS = 5
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function SignalMatrix() {
  const matrixRef = useRef<HTMLDivElement | null>(null)
  const [pointer, setPointer] = useState<PointerMatrix>({ x: 0.5, y: 0.5 })
  const [isActive, setIsActive] = useState(false)
  const { state, settings, activateTarget, deactivateTarget } = useCursor()

  const cells = useMemo<MatrixCell[]>(() => {
    const output: MatrixCell[] = []
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        output.push({ id: `cell-${row}-${col}`, row, col })
      }
    }
    return output
  }, [])

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = matrixRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    const ratioX = (event.clientX - bounds.left) / bounds.width
    const ratioY = (event.clientY - bounds.top) / bounds.height
    setPointer({
      x: clamp(ratioX, 0, 1),
      y: clamp(ratioY, 0, 1),
    })
    setIsActive(true)
  }

  const handlePointerLeave = () => {
    setIsActive(false)
    deactivateTarget('signal-matrix')
  }

  const speed = clamp(Math.hypot(state.vx, state.vy) * 420, 0, 1.3)
  const flow = clamp(settings.rippleStrength, 0, 1)
  const direction = Math.atan2(state.vy, state.vx)
  const angleDeg = Math.round(((direction + Math.PI) / (2 * Math.PI)) * 360)

  return (
    <section className="signal-matrix" aria-labelledby="signal-matrix-title">
      <header>
        <p className="section-label">Velocity telemetry</p>
        <h2 id="signal-matrix-title">Signal matrix analyzer</h2>
        <p className="section-subtitle">
          Paint across the grid to stir charge into columns. Velocity shifts ripple outward based on your vector.
        </p>
      </header>
      <div
        ref={matrixRef}
        className="signal-matrix__grid"
        onPointerEnter={() => activateTarget('signal-matrix', { variant: 'control' })}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        data-active={isActive}
      >
        {cells.map((cell) => {
          const cellCenterX = (cell.col + 0.5) / COLS
          const cellCenterY = (cell.row + 0.5) / ROWS
          const dx = cellCenterX - pointer.x
          const dy = cellCenterY - pointer.y
          const distance = Math.hypot(dx, dy)
          const falloff = Math.exp(-distance * (3.1 - flow * 1.2))
          const velocityBoost = 0.4 + speed * 0.6
          const energy = clamp(falloff * velocityBoost, 0, 1.35)

          const cellStyle: CSSProperties & Record<'--cell-energy', string> = {
            '--cell-energy': `${energy}`,
          }

          return <span key={cell.id} className="signal-matrix__cell" style={cellStyle} />
        })}
        <div className="signal-matrix__cursor" style={{
          left: `${pointer.x * 100}%`,
          top: `${pointer.y * 100}%`,
          opacity: isActive ? 1 : 0,
        }}
        />
      </div>
      <footer className="signal-matrix__readout">
        <div>
          <span className="readout-label">Vector heading</span>
          <span className="readout-value">{Number.isNaN(angleDeg) ? 'idle' : `${angleDeg}°`}</span>
        </div>
        <div>
          <span className="readout-label">Flow gain</span>
          <span className="readout-value">{(flow * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="readout-label">Velocity factor</span>
          <span className="readout-value">{(speed * 100).toFixed(0)}%</span>
        </div>
      </footer>
    </section>
  )
}
