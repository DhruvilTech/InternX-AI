import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigation } from '../../context/NavigationContext'

export default function Footer() {
  const { navigate } = useNavigation()

  const handleLinkClick = (e, pageId, hashId) => {
    e.preventDefault()
    if (hashId) {
      navigate('landing')
      setTimeout(() => {
        const el = document.getElementById(hashId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      navigate(pageId)
    }
  }

  return (
    <footer className="border-t border-border bg-void relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <a href="#/" onClick={(e) => handleLinkClick(e, 'landing')} className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet">
                <img src="/logo.png" alt="InternX AI" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-lg font-display font-semibold text-text">InternX AI</span>
            </a>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              Gain real experience before your first job. Join simulated AI companies, write code deliverables, and get audited by automated evaluations.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg glass text-muted hover:text-text transition-colors">
                <FaLinkedin size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg glass text-muted hover:text-text transition-colors">
                <FaXTwitter size={15} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg glass text-muted hover:text-text transition-colors">
                <FaGithub size={16} />
              </a>
            </div>
          </div>

          {/* Links Categories */}
          <div>
            <p className="text-sm font-semibold mb-4 text-text">Product</p>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <a href="#/" onClick={(e) => handleLinkClick(e, 'landing', 'generator')} className="hover:text-text transition-colors">
                  AI generator
                </a>
              </li>
              <li>
                <a href="#/" onClick={(e) => handleLinkClick(e, 'landing', 'evaluation')} className="hover:text-text transition-colors">
                  Evaluation engine
                </a>
              </li>
              <li>
                <a href="#/" onClick={(e) => handleLinkClick(e, 'landing', 'interview')} className="hover:text-text transition-colors">
                  Interview simulator
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-4 text-text">Enterprise Portals</p>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <a href="#/" onClick={(e) => handleLinkClick(e, 'career_selection')} className="hover:text-text transition-colors">
                  For Students
                </a>
              </li>
              <li>
                <a href="#/" onClick={(e) => handleLinkClick(e, 'recruiter_login')} className="hover:text-text transition-colors text-amber-500 font-semibold">
                  For Recruiters
                </a>
              </li>
              <li>
                <a href="#/" onClick={(e) => handleLinkClick(e, 'college_login')} className="hover:text-text transition-colors text-emerald font-semibold">
                  For Colleges
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-4 text-text">Corporate</p>
            <ul className="space-y-3 text-sm text-muted font-medium">
              <li><a href="#" className="hover:text-text">About Us</a></li>
              <li><a href="#" className="hover:text-text">Press Kit</a></li>
              <li><a href="#" className="hover:text-text">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-dim">
          <p>
            &copy; {new Date().getFullYear()} InternX AI. Built with dark grid. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-muted transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-muted transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

