import { motion } from 'framer-motion'

export default function ProgressBar({ label, value, delay = 0, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    secondary: 'bg-secondary dark:bg-slate-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text">{label}</span>
        <span className="text-sm font-semibold text-heading">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorMap[color]}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
