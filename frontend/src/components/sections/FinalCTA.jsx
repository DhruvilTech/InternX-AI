import { motion } from 'framer-motion'
import MagneticButton from '../ui/MagneticButton'

export default function FinalCTA() {
  return (
    <section id="cta" className="relative py-40 overflow-hidden">

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Stop Waiting
            <br />
            For Experience.
            <br />
            <span className="text-gradient">Start Building It.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted max-w-xl mx-auto mb-12"
          >
            Join thousands of students gaining real experience through AI-powered internships.
            Your first job starts here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton variant="glow" href="#generator" className="text-base px-10 py-4">
              Start Your Internship — Free
            </MagneticButton>
            <MagneticButton variant="ghost" href="#recruiters">
              I&apos;m a Recruiter
            </MagneticButton>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
