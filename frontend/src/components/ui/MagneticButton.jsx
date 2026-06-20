import { motion } from 'framer-motion'
import useMagnetic from '../../hooks/useMagnetic'

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  variant = 'primary',
}) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic(0.25)

  const base =
    'relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden'

  const variants = {
    primary:
      'bg-gradient-to-r from-accent to-violet text-white shadow-lg shadow-accent/25 hover:shadow-accent/40',
    glow: 'bg-white text-slate-900 shadow-[0_0_60px_rgba(129,140,248,0.4)] hover:shadow-[0_0_80px_rgba(129,140,248,0.6)]',
    ghost:
      'glass text-text hover:border-border-bright hover:bg-elevated/80',
  }

  const inner = (
    <motion.span
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`${base} ${variants[variant]} ${className}`}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      )}
    </motion.span>
  )

  if (href) {
    return (
      <a href={href} className="inline-block">
        {inner}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className="inline-block">
      {inner}
    </button>
  )
}
