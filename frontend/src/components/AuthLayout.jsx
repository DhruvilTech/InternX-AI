import { motion } from 'framer-motion';

/**
 * Layout wrapper for Authentication screens (Login, Signup, Recovery).
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 relative z-[2]">
      {/* Visual Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-md p-8 rounded-2xl border border-border glass bg-surface/30 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-8">
          {/* Brand Logo */}
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet shadow-lg shadow-accent/25">
            <span className="text-base font-black text-white font-display">IX</span>
          </div>
          
          <h2 className="mt-5 text-xl font-display font-bold tracking-tight text-text">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-xs text-muted">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
}
