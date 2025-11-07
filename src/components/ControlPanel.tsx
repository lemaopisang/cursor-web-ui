import { useCursor } from '../cursor/CursorContext'

export function ControlPanel() {
  const {
    settings,
    toggleSetting,
    setParallax,
    setParticleDensity,
    setDepthStrength,
    setFluxIntensity,
    setRippleStrength,
    setInertiaIntensity,
    setDragFactor,
    setOscillationDepth,
    activateTarget,
    deactivateTarget,
  } = useCursor()

  return (
    <section
      className="control-panel"
      onPointerEnter={() => activateTarget('control-panel', { variant: 'control' })}
      onPointerLeave={() => deactivateTarget('control-panel')}
    >
      <header>
        <h2>Interaction Controls</h2>
        <p>Dial the responsiveness of the playground without pausing the show.</p>
      </header>
      <div className="control-grid">
        <label className="control-toggle">
          <input
            type="checkbox"
            checked={settings.magnetic}
            onChange={() => toggleSetting('magnetic')}
          />
          <span>Magnetic surfaces</span>
        </label>
        <label className="control-toggle">
          <input
            type="checkbox"
            checked={settings.spotlight}
            onChange={() => toggleSetting('spotlight')}
          />
          <span>Spotlight glow</span>
        </label>
        <label className="control-toggle">
          <input
            type="checkbox"
            checked={settings.trails}
            onChange={() => toggleSetting('trails')}
          />
          <span>Motion trails</span>
        </label>
        <label className="control-slider">
          <span>Parallax intensity</span>
          <input
            type="range"
            min={0}
            max={40}
            value={settings.parallaxIntensity}
            onChange={(event) => setParallax(Number(event.target.value))}
          />
          <output>{settings.parallaxIntensity}</output>
        </label>
        <label className="control-slider">
          <span>Particle density</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.particleDensity * 100)}
            onChange={(event) => setParticleDensity(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.particleDensity * 100)}%</output>
        </label>
        <label className="control-slider">
          <span>Depth warp</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.depthStrength * 100)}
            onChange={(event) => setDepthStrength(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.depthStrength * 100)}%</output>
        </label>
        <label className="control-slider">
          <span>Flux intensity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.fluxIntensity * 100)}
            onChange={(event) => setFluxIntensity(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.fluxIntensity * 100)}%</output>
        </label>
        <label className="control-slider">
          <span>Ripple strength</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.rippleStrength * 100)}
            onChange={(event) => setRippleStrength(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.rippleStrength * 100)}%</output>
        </label>
        <label className="control-slider">
          <span>Inertia smoothing</span>
          <input
            type="range"
            min={0}
            max={95}
            value={Math.round(settings.inertiaIntensity * 100)}
            onChange={(event) => setInertiaIntensity(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.inertiaIntensity * 100)}%</output>
        </label>
        <label className="control-slider">
          <span>Drag factor</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.dragFactor * 100)}
            onChange={(event) => setDragFactor(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.dragFactor * 100)}%</output>
        </label>
        <label className="control-slider">
          <span>Oscillation depth</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.oscillationDepth * 100)}
            onChange={(event) => setOscillationDepth(Number(event.target.value) / 100)}
          />
          <output>{Math.round(settings.oscillationDepth * 100)}%</output>
        </label>
      </div>
    </section>
  )
}
