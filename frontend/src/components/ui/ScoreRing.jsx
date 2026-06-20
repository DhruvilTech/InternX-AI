import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ScoreRing({ score, size = 120, strokeWidth = 6, label }) {
  const { isDark } = useTheme()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const trackStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'

  // Dynamic color based on score value
  let strokeColor = '#818cf8'; // Indigo default
  if (score >= 90) strokeColor = '#10b981'; // Emerald/Green for high scores
  else if (score >= 70) strokeColor = '#22d3ee'; // Cyan/Blue for medium-high
  else if (score >= 40) strokeColor = '#f59e0b'; // Amber for medium
  else if (score > 0) strokeColor = '#ef4444'; // Red for low
  else strokeColor = 'rgba(255,255,255,0.15)'; // Dim for 0

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
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
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
