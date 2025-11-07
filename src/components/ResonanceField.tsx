import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useCursor } from '../cursor/CursorContext'

type NodeSeed = {
  id: string
  row: number
  col: number
  depth: number
}

const ROWS = 7
const COLS = 11

function createSeeds(): NodeSeed[] {
  const seeds: NodeSeed[] = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const depth = Math.random() * 0.8 + 0.2
      seeds.push({ id: `${row}-${col}`, row, col, depth })
    }
  }
  return seeds
}

export function ResonanceField() {
  const seeds = useMemo(() => createSeeds(), [])
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [pointerRatio, setPointerRatio] = useState({ x: 0.5, y: 0.5 })
  const {
    state: { vx, vy },
    settings,
    activateTarget,
    deactivateTarget,
  } = useCursor()

  useEffect(() => {
    if (!fieldRef.current) return
    const speed = Math.min(1, Math.hypot(vx, vy) * 90)
    fieldRef.current.style.setProperty('--field-speed', speed.toFixed(3))
  }, [vx, vy])

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = fieldRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    const localX = event.clientX - bounds.left
    const localY = event.clientY - bounds.top
    setPointerRatio({
      x: Math.min(1, Math.max(0, localX / bounds.width)),
      y: Math.min(1, Math.max(0, localY / bounds.height)),
    })
  }

  return (
    <section className="resonance-field">
      <header>
        <h2>Resonance Grid</h2>
        <p>Wave through the lattice — the nodes bend toward your orbit.</p>
      </header>
      <div
        ref={fieldRef}
        className="field-canvas"
        data-active={isActive}
        onPointerEnter={() => {
          setIsActive(true)
          activateTarget('resonance-field', { variant: 'inspect' })
        }}
        onPointerLeave={() => {
          setIsActive(false)
          setPointerRatio({ x: 0.5, y: 0.5 })
          deactivateTarget('resonance-field')
        }}
        onPointerMove={handlePointerMove}
      >
        {seeds.map((seed) => {
          const colSteps = Math.max(1, COLS - 1)
          const rowSteps = Math.max(1, ROWS - 1)
          const baseX = seed.col / colSteps
          const baseY = seed.row / rowSteps
          const dx = pointerRatio.x - baseX
          const dy = pointerRatio.y - baseY
          const distance = Math.hypot(dx, dy)
          const influence = isActive ? Math.max(0, 1 - distance * 1.9) : 0
          const translateX = dx * 80 * seed.depth * influence
          const translateY = dy * 80 * seed.depth * influence
          const scale = 0.7 + influence * 0.9
          const glow = 0.2 + influence * 0.8

          return (
            <span
              key={seed.id}
              className="field-node"
              style={{
                '--node-left': `${baseX * 100}%`,
                '--node-top': `${baseY * 100}%`,
                '--node-scale': scale,
                '--node-glow': glow,
                transform: `translate3d(-50%, -50%, 0) translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
              } as CSSProperties}
            />
          )
        })}
        {settings.spotlight && (
          <div
            className="field-spotlight"
            aria-hidden="true"
            style={{
              left: `${pointerRatio.x * 100}%`,
              top: `${pointerRatio.y * 100}%`,
              opacity: isActive ? 1 : 0,
            }}
          />
        )}
      </div>
    </section>
  )
}
