import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Spotlight() {
  const containerRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 80, damping: 25 })
  const springY = useSpring(y, { stiffness: 80, damping: 25 })

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  return (
    <motion.div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: springX,
          y: springY,
          width: 600,
          height: 600,
          background:
            'radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(34,211,238,0.04) 35%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
