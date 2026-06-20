import { motion } from 'framer-motion';

/**
 * Premium full-screen spinner overlay.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-void/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Futuristic background glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute h-24 w-24 rounded-full bg-accent/30 blur-xl"
        />
        
        {/* Outer loading ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-2 border-border border-t-accent"
        />

        {/* Logo text center */}
        <img src="/logo.png" alt="InternX Logo" className="absolute h-6 w-6 object-contain" />
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-[10px] font-bold uppercase tracking-widest text-muted"
      >
        Synchronizing Session...
      </motion.p>
    </div>
  );
}
