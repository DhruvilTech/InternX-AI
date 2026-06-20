import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function MatrixRain() {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()
  const isDarkRef = useRef(isDark)

  useEffect(() => {
    isDarkRef.current = isDark
  }, [isDark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const fontSize = 14
    let columns = Math.floor(canvas.width / fontSize)
    let drops = Array(columns).fill(1)

    // Reset columns on window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      columns = Math.floor(canvas.width / fontSize)
      drops = Array(columns).fill(1)
    }
    window.addEventListener('resize', handleResize)

    const chars = '01BINARYCODINGAIINTERFACEINTERNXSYSTEM$_[]{}()<>/\\+=-*%&!?'

    const draw = () => {
      const activeDark = isDarkRef.current

      // Paint transparent background to create trail
      ctx.fillStyle = activeDark
        ? 'rgba(3, 7, 18, 0.12)'  // Match bg-void in dark mode
        : 'rgba(248, 250, 252, 0.12)' // Match bg-void in light mode
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set text properties
      ctx.font = `${fontSize}px monospace`

      // Dynamic color array depending on active theme accents
      const darkPalette = ['#818cf8', '#8b5cf6', '#22d3ee']
      const lightPalette = ['#4f46e5', '#6d28d9', '#0891b2']
      const palette = activeDark ? darkPalette : lightPalette

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)]

        // Random color selection from theme accents
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)]

        // Render character (very low opacity so it is a subtle backdrop)
        ctx.save()
        ctx.globalAlpha = activeDark ? 0.04 : 0.03
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        ctx.restore()

        // Wrap drop around screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none z-[0]"
    />
  )
}
