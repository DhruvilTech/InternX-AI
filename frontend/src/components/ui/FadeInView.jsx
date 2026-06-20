import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function FadeInView({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = true,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-60px' })

  const offsets = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { x: 0, y: 0 },
  }

  const { x, y } = offsets[direction] || offsets.up

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
