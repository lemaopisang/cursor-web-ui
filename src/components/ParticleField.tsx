import { useEffect, useRef } from 'react'
import { useCursor } from '../cursor/CursorContext'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  size: number
  hue: number
}

const BASE_MAX_PARTICLES = 420
const FRAME_SCALE = 16

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    visible: false,
    pointerType: 'mouse',
  })
  const { state, settings } = useCursor()

  useEffect(() => {
    pointerRef.current = {
      x: state.x,
      y: state.y,
      vx: state.vx,
      vy: state.vy,
      visible: state.visible,
      pointerType: state.pointerType,
    }
  }, [state])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const particles = particlesRef.current

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const spawnParticles = (count: number) => {
      const { x, y, vx, vy, pointerType } = pointerRef.current
      if (pointerType !== 'mouse') return
      const speedBoost = Math.min(Math.hypot(vx, vy) * 320, 24)

      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * Math.PI * 2
        const baseVelocity = 0.12 + Math.random() * 0.18
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * (baseVelocity + speedBoost * 0.006),
          vy: Math.sin(angle) * (baseVelocity + speedBoost * 0.006),
          life: 0,
          ttl: 80 + Math.random() * 70,
          size: 1.2 + Math.random() * 2.4,
          hue: 210 + Math.random() * 90,
        })
      }
    }

    let animationFrame = 0
    const render = () => {
      const { visible } = pointerRef.current
      const maxParticles = Math.floor(BASE_MAX_PARTICLES * (0.35 + settings.particleDensity))
      const spawnRate = settings.trails && visible ? Math.max(0, Math.round(settings.particleDensity * 20)) : 0

      if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles)
      }

      if (spawnRate > 0) {
        spawnParticles(spawnRate)
      }

      context.clearRect(0, 0, canvas.width, canvas.height)
      context.globalCompositeOperation = 'lighter'

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.life += 1
        if (particle.life >= particle.ttl) {
          particles.splice(index, 1)
          continue
        }

        particle.vx *= 0.96
        particle.vy *= 0.96
        particle.x += particle.vx * FRAME_SCALE
        particle.y += particle.vy * FRAME_SCALE

        if (
          particle.x < -120 ||
          particle.x > canvas.width + 120 ||
          particle.y < -120 ||
          particle.y > canvas.height + 120
        ) {
          particles.splice(index, 1)
          continue
        }

        const fade = 1 - particle.life / particle.ttl
        const alpha = Math.max(0, Math.min(1, fade * 0.75))

        context.beginPath()
        context.fillStyle = `hsla(${particle.hue}, 85%, 65%, ${alpha})`
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()
      }

      context.globalCompositeOperation = 'source-over'
      animationFrame = window.requestAnimationFrame(render)
    }

    animationFrame = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(animationFrame)
      particlesRef.current = particles
    }
  }, [settings.particleDensity, settings.trails])

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
}
