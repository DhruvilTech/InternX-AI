import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ScoreRing({ score, size = 120, strokeWidth = 6, label }) {
  const { isDark } = useTheme()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const trackStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackStroke}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className={`font-display font-bold text-text ${size <= 80 ? 'text-lg' : 'text-2xl'}`}>{score}</span>
        {label && <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  )
}
