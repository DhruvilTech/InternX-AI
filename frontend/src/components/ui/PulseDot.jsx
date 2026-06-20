import { motion } from 'framer-motion'

export default function PulseDot({ color = 'emerald', size = 8 }) {
  const colors = {
    emerald: 'bg-emerald',
    accent: 'bg-accent',
    cyan: 'bg-cyan',
    amber: 'bg-amber',
    rose: 'bg-rose',
  }

  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <motion.span
        className={`absolute inset-0 rounded-full ${colors[color]} opacity-75`}
        animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className={`relative rounded-full ${colors[color]}`} style={{ width: size, height: size }} />
    </span>
  )
}
