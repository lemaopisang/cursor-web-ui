import { useMemo } from 'react'
import { useCursor } from '../cursor/CursorContext'

export function CursorTelemetry() {
  const {
    state: { x, y, vx, vy, variant, activeTarget, pointerType, isPointerDown },
    activateTarget,
    deactivateTarget,
  } = useCursor()

  const velocity = useMemo(() => Math.sqrt(vx ** 2 + vy ** 2), [vx, vy])

  return (
    <aside
      className="cursor-telemetry"
      onPointerEnter={() => activateTarget('telemetry', { variant: 'inspect' })}
      onPointerLeave={() => deactivateTarget('telemetry')}
    >
      <header>
        <h2>Cursor Telemetry</h2>
        <p>Live feed of position, momentum, and mode.</p>
      </header>
      <dl>
        <div>
          <dt>Coordinates</dt>
          <dd>
            {Math.round(x)}, {Math.round(y)}
          </dd>
        </div>
        <div>
          <dt>Velocity</dt>
          <dd>{velocity.toFixed(2)} px/ms</dd>
        </div>
        <div>
          <dt>Pointer</dt>
          <dd>{pointerType}</dd>
        </div>
        <div>
          <dt>Variant</dt>
          <dd>{variant}</dd>
        </div>
        <div>
          <dt>Pressed</dt>
          <dd>{isPointerDown ? 'yes' : 'no'}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{activeTarget ?? 'none'}</dd>
        </div>
      </dl>
    </aside>
  )
}
