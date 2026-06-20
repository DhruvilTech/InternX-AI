import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'

const footerLinks = {
  Product: [
    { label: 'Internship Generator', href: '#generator' },
    { label: 'AI Evaluation', href: '#evaluation' },
    { label: 'Interview Simulator', href: '#interview' },
    { label: 'Certificates', href: '#certificate' },
  ],
  Platform: [
    { label: 'For Students', href: '#hero' },
    { label: 'For Recruiters', href: '#recruiters' },
    { label: 'For Colleges', href: '#features' },
    { label: 'Features', href: '#features' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
}

const socialLinks = [
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaXTwitter, href: '#', label: 'Twitter' },
  { icon: FaGithub, href: '#', label: 'GitHub' },
  { icon: Mail, href: 'mailto:hello@internx.ai', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-void">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet">
                <span className="text-sm font-bold text-white font-display">IX</span>
              </div>
              <span className="text-lg font-display font-semibold">InternX AI</span>
            </a>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              Gain real experience before your first job. AI-powered internships that
              prepare you for the real world.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg glass text-muted hover:text-text hover:border-border-bright transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-sm font-semibold mb-4">{category}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted hover:text-text transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-dim">
            &copy; {new Date().getFullYear()} InternX AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-dim hover:text-muted transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-dim hover:text-muted transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
