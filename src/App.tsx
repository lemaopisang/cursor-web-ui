import './App.css'
import { ActionPalette } from './components/ActionPalette'
import { ParticleField } from './components/ParticleField'
import { CursorOverlay } from './components/CursorOverlay'
import { ControlPanel } from './components/ControlPanel'
import { CursorTelemetry } from './components/CursorTelemetry'
import { FooterLinks } from './components/FooterLinks'
import { HeroSurface } from './components/HeroSurface'
import { InteractiveGrid } from './components/InteractiveGrid'
import { OrbitalSwarm } from './components/OrbitalSwarm'
import { DepthGallery } from './components/DepthGallery'
import { ResonanceField } from './components/ResonanceField'
import { TimelineStrip } from './components/TimelineStrip'
import { VelocityWave } from './components/VelocityWave'
import { SignalMatrix } from './components/SignalMatrix'
import { CursorEventAtlas } from './components/CursorEventAtlas'

function App() {
  return (
    <div className="app-shell">
      <ParticleField />
      <CursorOverlay />
      <HeroSurface />
      <ResonanceField />
      <OrbitalSwarm />
      <DepthGallery />
      <CursorEventAtlas />
      <div className="data-panels">
        <CursorTelemetry />
        <VelocityWave />
      </div>
      <SignalMatrix />
      <InteractiveGrid />
      <TimelineStrip />
      <ActionPalette />
      <ControlPanel />
      <FooterLinks />
    </div>
  )
}

export default App
