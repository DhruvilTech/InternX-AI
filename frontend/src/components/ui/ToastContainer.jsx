import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useNavigation } from '../../context/NavigationContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useNavigation()

  return (
    <div className="fixed top-20 right-6 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          let Icon = Info
          let typeClass = 'border-accent text-accent bg-accent/10'
          if (t.type === 'success') {
            Icon = CheckCircle2
            typeClass = 'border-emerald text-emerald bg-emerald/10'
          } else if (t.type === 'error') {
            Icon = AlertCircle
            typeClass = 'border-rose text-rose bg-rose/10'
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border glass backdrop-blur-md shadow-lg ${typeClass}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="shrink-0" />
                <span className="text-xs font-semibold text-text">{t.title}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-4 p-1 hover:bg-white/10 rounded text-muted hover:text-text"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
