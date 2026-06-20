import { motion } from 'framer-motion'
import { HelpCircle, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

export function Page404() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4 text-text relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-bright p-8 sm:p-10 rounded-2xl border border-border shadow-xl glow-accent text-center bg-void/50 space-y-6"
      >
        <div className="mx-auto w-14 h-14 bg-rose/10 border border-rose/20 text-rose flex items-center justify-center rounded-full">
          <HelpCircle size={28} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-4xl font-bold text-gradient-violet">404</h3>
          <h4 className="font-display text-lg font-bold text-text">Workspace Offset Out of Bounds</h4>
          <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
            The workspace endpoint you are seeking does not exist on this compiler.
          </p>
        </div>

        <button
          onClick={() => navigate('landing')}
          className="w-full py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Homepage</span>
        </button>
      </motion.div>
    </div>
  )
}

export function MaintenancePage() {
  const { navigate, addToast } = useNavigation()

  const handleRefresh = () => {
    addToast('Testing server nodes latency...', 'info')
    setTimeout(() => {
      addToast('All node checks verified. System fully functional.', 'success')
      navigate('landing')
    }, 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4 text-text relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-bright p-8 sm:p-10 rounded-2xl border border-border shadow-xl glow-accent text-center bg-void/50 space-y-6"
      >
        <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded-full">
          <ShieldAlert size={28} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <h4 className="font-display text-lg font-bold text-text">Undergoing System Sync</h4>
          <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
            InternX AI models compile nodes are undergoing scheduled updates to sync with new vector index configurations.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="w-full py-2.5 bg-surface-muted border border-border text-xs text-text hover:border-border-strong rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          <span>Test Server Latency</span>
        </button>
      </motion.div>
    </div>
  )
}
