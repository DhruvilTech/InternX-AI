import { motion } from 'framer-motion'
import { Award, QrCode, ShieldCheck } from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

export default function Certificate() {
  return (
    <section className="section-padding section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Credentials"
          title="Verified Certificates That Recruiters Trust"
          description="Every completed internship earns a professionally designed, QR-verifiable certificate with performance scores and skill breakdowns."
        />

        <FadeInView>
          <motion.div
            whileHover={{ scale: 1.01, y: -4 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative surface-card border-2 p-8 sm:p-12 shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

              <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-border surface-panel-muted">
                  <QrCode size={32} className="text-heading" />
                </div>
                <p className="text-[10px] text-center text-subtle mt-1">Verify</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full icon-box-primary mb-6">
                  <Award size={28} className="text-primary" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                  Certificate of Completion
                </p>

                <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-heading">
                  Priya Sharma
                </h3>

                <p className="mt-2 text-subtle">
                  has successfully completed the virtual internship program
                </p>

                <div className="mt-6 inline-block px-6 py-3 rounded-xl surface-panel-muted">
                  <p className="text-lg font-semibold text-heading">AI Engineer Intern</p>
                  <p className="text-sm text-subtle mt-1">NeuralMind Technologies</p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-8">
                  <div>
                    <p className="text-xs text-subtle uppercase tracking-wider">
                      Performance Score
                    </p>
                    <p className="text-3xl font-bold text-accent mt-1">92/100</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="text-xs text-subtle uppercase tracking-wider">Duration</p>
                    <p className="text-lg font-semibold text-heading mt-1">8 Weeks</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 divider flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs text-subtle">Issued by</p>
                    <p className="text-sm font-semibold text-heading">InternX AI</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-accent">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-semibold">Verified Credential</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-subtle">Date</p>
                    <p className="text-sm font-semibold text-heading">June 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </FadeInView>
      </div>
    </section>
  )
}
