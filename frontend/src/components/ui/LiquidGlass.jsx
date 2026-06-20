import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function LiquidGlass() {
  const { isDark } = useTheme()

  return (
    <div className="fixed inset-0 z-[0] overflow-hidden pointer-events-none select-none opacity-40">
      {/* Glow Blob 1 - Indigo */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -100, 60, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[10%] left-[10%] w-[450px] h-[450px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Glow Blob 2 - Violet */}
      <motion.div
        animate={{
          x: [0, -90, 70, 0],
          y: [0, 80, -90, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
        }}
      />

      {/* Glow Blob 3 - Cyan */}
      <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, 90, -60, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
