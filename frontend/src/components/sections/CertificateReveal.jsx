import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Award, ShieldCheck, QrCode, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function CertificateReveal() {
  const sectionRef = useRef(null)
  const certRef = useRef(null)
  const sweepRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => setRevealed(true), 800)
    return () => clearTimeout(timer)
  }, [isInView])

  useEffect(() => {
    if (!isInView || !certRef.current || !sweepRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(certRef.current, {
        scale: 0.8,
        rotateY: -15,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
      })

      gsap.to(sweepRef.current, {
        x: '200%',
        duration: 1.5,
        delay: 0.8,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [isInView])

  return (
    <section
      ref={sectionRef}
      id="certificate"
      className="relative py-24 lg:py-32 min-h-0 flex items-center"
    >
      {/* Cinematic dark bg */}
      <div className="absolute inset-0 bg-void" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 50% at 50% 50%, rgba(129,140,248,0.15), transparent 70%)',
        }}
      />
      <div className="absolute inset-0 noise opacity-50" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold text-accent uppercase tracking-[0.3em] mb-8"
        >
          Certificate Reveal
        </motion.p>

        <div className="relative perspective-[1200px] inline-block w-full max-w-2xl">
          <motion.div
            ref={certRef}
            className="relative glass-bright rounded-2xl p-8 sm:p-12 lg:p-14 glow-accent"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Light sweep */}
            <div
              ref={sweepRef}
              className="absolute inset-y-0 -left-full w-1/2 pointer-events-none z-20"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                transform: 'skewX(-20deg)',
              }}
            />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={revealed ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5, type: 'spring' }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-violet flex items-center justify-center"
              >
                <Award size={32} className="text-white" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
                className="text-xs text-muted uppercase tracking-[0.2em] mb-2"
              >
                InternX AI Certified
              </motion.p>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9 }}
                className="font-display text-3xl sm:text-4xl font-bold mb-2"
              >
                Arjun Kapoor
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : {}}
                transition={{ delay: 1.1 }}
                className="text-muted mb-6"
              >
                AI Engineer Internship · NeuralMind Technologies
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : {}}
                transition={{ delay: 1.3 }}
                className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald" />
                  <span className="text-sm">Blockchain Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-accent" />
                  <span className="text-sm">Score: 92/100</span>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={revealed ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.6, type: 'spring' }}
                  className="w-16 h-16 rounded-lg bg-white p-1 shadow-sm"
                >
                  <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
                    <QrCode size={28} className="text-white" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8 }}
          className="mt-10 text-muted text-sm"
        >
          Shareable, verifiable, and recognized by 200+ hiring partners
        </motion.p>
      </div>
    </section>
  )
}
