import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

type CursorVariant =
  | 'default'
  | 'link'
  | 'press'
  | 'drag'
  | 'inspect'
  | 'control'

type CursorSettings = {
  parallaxIntensity: number
  magnetic: boolean
  spotlight: boolean
  trails: boolean
  particleDensity: number
  depthStrength: number
  fluxIntensity: number
  rippleStrength: number
  inertiaIntensity: number
  dragFactor: number
  oscillationDepth: number
}

type CursorState = {
  x: number
  y: number
  vx: number
  vy: number
  visible: boolean
  isPointerDown: boolean
  pointerType: string
  variant: CursorVariant
  activeTarget?: string
  lastClick: number
  smoothedVx: number
  smoothedVy: number
  speed: number
  angle: number
  oscillation: number
}

type CursorContextValue = {
  state: CursorState
  settings: CursorSettings
  setVariant: (variant: CursorVariant) => void
  activateTarget: (
    id: string,
    options?: {
      variant?: CursorVariant
    },
  ) => void
  deactivateTarget: (id: string) => void
  toggleSetting: (key: keyof CursorSettings) => void
  setParallax: (value: number) => void
  setParticleDensity: (value: number) => void
  setDepthStrength: (value: number) => void
  setFluxIntensity: (value: number) => void
  setRippleStrength: (value: number) => void
  setInertiaIntensity: (value: number) => void
  setDragFactor: (value: number) => void
  setOscillationDepth: (value: number) => void
}

const CursorContext = createContext<CursorContextValue | null>(null)

const INITIAL_STATE: CursorState = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  visible: false,
  isPointerDown: false,
  pointerType: 'mouse',
  variant: 'default',
  activeTarget: undefined,
  lastClick: 0,
  smoothedVx: 0,
  smoothedVy: 0,
  speed: 0,
  angle: 0,
  oscillation: 0,
}

const INITIAL_SETTINGS: CursorSettings = {
  parallaxIntensity: 12,
  magnetic: true,
  spotlight: true,
  trails: true,
  particleDensity: 0.6,
  depthStrength: 0.75,
  fluxIntensity: 0.65,
  rippleStrength: 0.7,
  inertiaIntensity: 0.35,
  dragFactor: 0.18,
  oscillationDepth: 0.25,
}

export function CursorProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(INITIAL_STATE)
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const lastPositionRef = useRef({ x: 0, y: 0, ts: performance.now() })
  const smoothedVelocityRef = useRef({ vx: 0, vy: 0 })
  const settingsRef = useRef(INITIAL_SETTINGS)
  const oscillatorRef = useRef({ phase: 0 })
  const animationRef = useRef<number | null>(null)
  const lastFrameRef = useRef(performance.now())

  useEffect(() => {
    const body = document.body
    body.dataset.cursorActive = 'true'

    const handlePointerMove = (event: PointerEvent) => {
      const { clientX, clientY, pointerType } = event
      const now = performance.now()

      const last = lastPositionRef.current
      const deltaTime = Math.max(now - last.ts, 16)
      const vx = (clientX - last.x) / deltaTime
      const vy = (clientY - last.y) / deltaTime

      lastPositionRef.current = { x: clientX, y: clientY, ts: now }

      const config = settingsRef.current
      const smoothing = Math.min(Math.max(config.inertiaIntensity, 0), 0.95)
      const smoothedVx = smoothedVelocityRef.current.vx * smoothing + vx * (1 - smoothing)
      const smoothedVy = smoothedVelocityRef.current.vy * smoothing + vy * (1 - smoothing)
      smoothedVelocityRef.current = { vx: smoothedVx, vy: smoothedVy }

      setState((prev) => {
        const speed = Math.hypot(smoothedVx, smoothedVy)
        const angle = speed > 0.0001 ? Math.atan2(smoothedVy, smoothedVx) : prev.angle
        return {
          ...prev,
          x: clientX,
          y: clientY,
          vx,
          vy,
          smoothedVx,
          smoothedVy,
          speed,
          angle,
          pointerType,
          visible: true,
        }
      })
    }

    const handlePointerDown = (event: PointerEvent) => {
      setState((prev) => ({
        ...prev,
        isPointerDown: true,
        lastClick: event.timeStamp,
        variant: prev.variant === 'drag' ? 'drag' : 'press',
      }))
    }

    const handlePointerUp = () => {
      setState((prev) => ({
        ...prev,
        isPointerDown: false,
        variant: prev.variant === 'press' ? 'default' : prev.variant,
      }))
    }

    const handlePointerEnter = () => {
      setState((prev) => ({ ...prev, visible: true }))
    }

    const handlePointerLeave = () => {
      setState((prev) => ({ ...prev, visible: false, variant: 'default' }))
    }

    const handleVisibilityChange = () => {
      const isHidden = document.hidden
      setState((prev) => ({ ...prev, visible: !isHidden }))
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointerenter', handlePointerEnter, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      body.dataset.cursorActive = 'false'
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointerenter', handlePointerEnter)
      window.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--cursor-x', `${state.x}px`)
    root.style.setProperty('--cursor-y', `${state.y}px`)
    root.style.setProperty('--cursor-vx', `${state.vx}`)
    root.style.setProperty('--cursor-vy', `${state.vy}`)
    root.style.setProperty('--cursor-variant', state.variant)
    root.style.setProperty('--cursor-active-target', state.activeTarget ?? '')
    root.style.setProperty('--cursor-visible', state.visible ? '1' : '0')
    root.style.setProperty('--cursor-smoothed-vx', `${state.smoothedVx}`)
    root.style.setProperty('--cursor-smoothed-vy', `${state.smoothedVy}`)
    root.style.setProperty('--cursor-speed', `${state.speed}`)
    root.style.setProperty('--cursor-angle', `${state.angle}`)
    root.style.setProperty('--cursor-oscillation', `${state.oscillation}`)
  }, [state])

  useEffect(() => {
    const body = document.body
    if (state.pointerType === 'mouse') {
      body.style.cursor = 'none'
    } else {
      body.style.removeProperty('cursor')
    }

    return () => {
      body.style.removeProperty('cursor')
    }
  }, [state.pointerType])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--cursor-parallax', `${settings.parallaxIntensity}`)
    root.style.setProperty('--cursor-magnetic', settings.magnetic ? '1' : '0')
    root.style.setProperty('--cursor-spotlight', settings.spotlight ? '1' : '0')
    root.style.setProperty('--cursor-trails', settings.trails ? '1' : '0')
    root.style.setProperty('--cursor-particle-density', `${settings.particleDensity}`)
    root.style.setProperty('--cursor-depth-strength', `${settings.depthStrength}`)
    root.style.setProperty('--cursor-flux-intensity', `${settings.fluxIntensity}`)
    root.style.setProperty('--cursor-ripple-strength', `${settings.rippleStrength}`)
    root.style.setProperty('--cursor-inertia', `${settings.inertiaIntensity}`)
    root.style.setProperty('--cursor-drag', `${settings.dragFactor}`)
    root.style.setProperty('--cursor-oscillation-depth', `${settings.oscillationDepth}`)
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    const step = (timestamp: number) => {
      const previous = lastFrameRef.current
      const deltaMs = timestamp - previous
      lastFrameRef.current = timestamp
      const stepMultiplier = Math.min(deltaMs / 16.67, 3)
      const config = settingsRef.current
      const drag = Math.max(0, 1 - config.dragFactor * 0.08 * stepMultiplier)

      setState((prev) => {
        const dampedVx = prev.smoothedVx * drag
        const dampedVy = prev.smoothedVy * drag
        smoothedVelocityRef.current = { vx: dampedVx, vy: dampedVy }

        const speed = Math.hypot(dampedVx, dampedVy)
        const angle = speed > 0.0001 ? Math.atan2(dampedVy, dampedVx) : prev.angle

        const phaseDelta = speed * (0.18 + config.oscillationDepth * 0.25) * stepMultiplier
        oscillatorRef.current.phase = (oscillatorRef.current.phase + phaseDelta) % (Math.PI * 2)
        const oscillation = Math.sin(oscillatorRef.current.phase) * config.oscillationDepth

        if (
          Math.abs(dampedVx - prev.smoothedVx) < 0.0001 &&
          Math.abs(dampedVy - prev.smoothedVy) < 0.0001 &&
          Math.abs(speed - prev.speed) < 0.0001 &&
          Math.abs(oscillation - prev.oscillation) < 0.0001
        ) {
          return prev
        }

        return {
          ...prev,
          smoothedVx: dampedVx,
          smoothedVy: dampedVy,
          speed,
          angle,
          oscillation,
        }
      })

      animationRef.current = window.requestAnimationFrame(step)
    }

    animationRef.current = window.requestAnimationFrame(step)

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const setVariant = useCallback((variant: CursorVariant) => {
    setState((prev) => ({ ...prev, variant }))
  }, [])

  const activateTarget = useCallback(
    (id: string, options?: { variant?: CursorVariant }) => {
      setState((prev) => ({
        ...prev,
        activeTarget: id,
        variant: options?.variant ?? prev.variant,
      }))
    },
    [],
  )

  const deactivateTarget = useCallback((id: string) => {
    setState((prev) => {
      if (prev.activeTarget !== id) return prev
      return {
        ...prev,
        activeTarget: undefined,
        variant: 'default',
      }
    })
  }, [])

  const toggleSetting = useCallback((key: keyof CursorSettings) => {
    setSettings((prev) => {
      const value = prev[key]
      if (typeof value === 'boolean') {
        return { ...prev, [key]: !value }
      }
      return prev
    })
  }, [])

  const setParallax = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, parallaxIntensity: value }))
  }, [])

  const setParticleDensity = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, particleDensity: value }))
  }, [])

  const setDepthStrength = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, depthStrength: value }))
  }, [])

  const setFluxIntensity = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, fluxIntensity: value }))
  }, [])

  const setRippleStrength = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, rippleStrength: value }))
  }, [])

  const setInertiaIntensity = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, inertiaIntensity: value }))
  }, [])

  const setDragFactor = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, dragFactor: value }))
  }, [])

  const setOscillationDepth = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, oscillationDepth: value }))
  }, [])

  const contextValue = useMemo<CursorContextValue>(
    () => ({
      state,
      settings,
      setVariant,
      activateTarget,
      deactivateTarget,
      toggleSetting,
      setParallax,
      setParticleDensity,
      setDepthStrength,
      setFluxIntensity,
      setRippleStrength,
      setInertiaIntensity,
      setDragFactor,
      setOscillationDepth,
    }),
    [
      activateTarget,
      deactivateTarget,
      setVariant,
      settings,
      setParallax,
      state,
      toggleSetting,
      setParticleDensity,
      setDepthStrength,
      setFluxIntensity,
      setRippleStrength,
      setInertiaIntensity,
      setDragFactor,
      setOscillationDepth,
    ],
  )

  return <CursorContext.Provider value={contextValue}>{children}</CursorContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCursor() {
  const context = useContext(CursorContext)
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider')
  }
  return context
}
