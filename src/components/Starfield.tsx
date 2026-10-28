import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  alpha: number
  phase: number
  speed: number
  depth: number
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars: Star[] = []
    let width = 0
    let height = 0
    let raf = 0
    let running = true
    let pointerX = 0
    let pointerY = 0
    let resizeTimer = 0

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // 移动端降粒子数，避免每帧绘制过多精灵
      const count = width < 768 ? 55 : 120
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.25 + 0.35,
        alpha: Math.random() * 0.45 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0009 + 0.0003,
        depth: Math.random() * 0.85 + 0.15,
      }))
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        const x = (star.x + pointerX * star.depth * 16 + width) % width
        const y = (star.y + pointerY * star.depth * 16 + height) % height
        const twinkle = reduce ? 1 : 0.55 + 0.45 * Math.sin(time * star.speed + star.phase)
        const alpha = star.alpha * twinkle

        ctx.beginPath()
        ctx.arc(x, y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(226,232,255,${alpha.toFixed(3)})`
        ctx.fill()
      }
    }

    const loop = (time: number) => {
      draw(time)
      raf = requestAnimationFrame(loop)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reduce) return
      pointerX = event.clientX / window.innerWidth - 0.5
      pointerY = event.clientY / window.innerHeight - 0.5
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      // 拖动窗口时反复分配 canvas 代价高，做 150ms 防抖
      resizeTimer = window.setTimeout(() => {
        build()
        if (reduce) draw(0)
      }, 150)
    }

    const onVisibility = () => {
      if (reduce) return
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        raf = requestAnimationFrame(loop)
      }
    }

    build()
    if (reduce) {
      draw(0)
    } else {
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-ink" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.18] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
      />
      <div
        className="absolute -right-32 top-1/3 h-[460px] w-[460px] rounded-full opacity-[0.14] blur-[130px]"
        style={{ background: 'radial-gradient(circle, #22D3EE 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,rgba(11,15,26,0.85)_100%)]" />
    </div>
  )
}
