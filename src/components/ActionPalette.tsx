import { useMemo } from 'react'
import { useCursor } from '../cursor/CursorContext'

type ActionDescriptor = {
  id: string
  label: string
  description: string
  onInvoke: () => void
}

export function ActionPalette() {
  const {
    activateTarget,
    deactivateTarget,
    setVariant,
    toggleSetting,
    settings,
    setParticleDensity,
    setDepthStrength,
    setFluxIntensity,
    setRippleStrength,
  } = useCursor()

  const actions = useMemo<ActionDescriptor[]>(
    () => [
      {
        id: 'burst-trail',
        label: settings.trails ? 'Trails On' : 'Trails Off',
        description: 'Toggle motion trails around the custom cursor.',
        onInvoke: () => toggleSetting('trails'),
      },
      {
        id: 'spotlight',
        label: settings.spotlight ? 'Spotlight On' : 'Spotlight Off',
        description: 'Control the atmospheric glow intensity.',
        onInvoke: () => toggleSetting('spotlight'),
      },
      {
        id: 'inspect-variant',
        label: 'Inspect Pulse',
        description: 'Force the cursor into inspect mode for a quick highlight.',
        onInvoke: () => {
          setVariant('inspect')
          window.setTimeout(() => setVariant('default'), 480)
        },
      },
      {
        id: 'particle-surge',
        label: 'Particle Surge',
        description: 'Temporarily max-out the particle bloom for a comet tail.',
        onInvoke: () => {
          const base = settings.particleDensity
          setParticleDensity(Math.min(1, base + 0.35))
          window.setTimeout(() => setParticleDensity(base), 900)
        },
      },
      {
        id: 'depth-boost',
        label: 'Depth Boost',
        description: 'Push the layered gallery forward with amplified parallax.',
        onInvoke: () => {
          const base = settings.depthStrength
          setDepthStrength(Math.min(1, base + 0.4))
          window.setTimeout(() => setDepthStrength(base), 800)
        },
      },
      {
        id: 'flux-burst',
        label: 'Flux Burst',
        description: 'Spike swarm velocity to magnetize the orbital ribbons.',
        onInvoke: () => {
          const base = settings.fluxIntensity
          setFluxIntensity(Math.min(1, base + 0.5))
          window.setTimeout(() => setFluxIntensity(base), 850)
        },
      },
      {
        id: 'ripple-splash',
        label: 'Ripple Splash',
        description: 'Send a shockwave through the signal matrix falloff.',
        onInvoke: () => {
          const base = settings.rippleStrength
          setRippleStrength(Math.min(1, base + 0.45))
          window.setTimeout(() => setRippleStrength(base), 900)
        },
      },
    ],
    [
      setFluxIntensity,
      setDepthStrength,
      setParticleDensity,
      setRippleStrength,
      setVariant,
      settings.depthStrength,
      settings.fluxIntensity,
      settings.particleDensity,
      settings.rippleStrength,
      settings.spotlight,
      settings.trails,
      toggleSetting,
    ],
  )

  return (
    <section className="action-palette">
      <header>
        <h2>Gesture Palette</h2>
        <p>Trigger bursts, flip modes, and modulate the cursor state instantly.</p>
      </header>
      <div className="action-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onPointerEnter={() => activateTarget(action.id, { variant: 'control' })}
            onPointerLeave={() => deactivateTarget(action.id)}
            onClick={action.onInvoke}
          >
            <span className="action-label">{action.label}</span>
            <span className="action-description">{action.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
