import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function LiquidGlass() {
  const { isDark } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate particles on mount
  const particles = useMemo(() => {
    const list = []
    const count = 65 // Sparse particle count (50-80 total)

    for (let i = 0; i < count; i++) {
      // Determine depth layer: 0 (Far), 1 (Middle), 2 (Near)
      const layer = i % 3
      let size, opacity, baseDuration, driftYRange

      if (layer === 0) {
        // Far Layer
        size = 1
        opacity = 0.08
        baseDuration = 50 + Math.random() * 10 // 50-60 seconds duration
        driftYRange = 30 + Math.random() * 20  // 30-50px drift
      } else if (layer === 1) {
        // Middle Layer
        size = 1.5
        opacity = 0.15
        baseDuration = 35 + Math.random() * 15 // 35-50 seconds duration
        driftYRange = 50 + Math.random() * 25  // 50-75px drift
      } else {
        // Near Layer
        size = 2
        opacity = 0.25
        baseDuration = 20 + Math.random() * 15 // 20-35 seconds duration
        driftYRange = 75 + Math.random() * 25  // 75-100px drift
      }

      list.push({
        id: i,
        x: Math.random() * 100, // horizontal positioning percentage
        y: Math.random() * 100, // vertical positioning percentage
        size,
        opacity,
        duration: baseDuration,
        driftY: -driftYRange,
        driftX: (Math.random() - 0.5) * 20, // slight horizontal variation
        delay: -Math.random() * baseDuration, // negative delay so particles start scattered in-motion
      })
    }
    return list
  }, [])

  // Grid line color changes depending on dark/light theme
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(15, 23, 42, 0.035)'
  const particleColor = isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(15, 23, 42, 1)'

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-[0] bg-void overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }}
    >
      {/* Particle depth layer */}
      {mounted && (
        <div className="absolute inset-0 z-[1] w-full h-full overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: particleColor,
                opacity: p.opacity,
              }}
              animate={{
                y: [0, p.driftY],
                x: [0, p.driftX, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
