import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Lock, Bell, Shield, Eye, Save } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ui/ThemeToggle'
import useAuth from '../hooks/useAuth'
import * as authApi from '../api/authApi'

export default function SettingsPage() {
  const { addToast, internship } = useNavigation()
  const { isDark, toggleTheme } = useTheme()
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('account') // account, password, notifications, privacy
  
  // Account Form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Sync inputs with user context
  useEffect(() => {
    if (user) {
      setName(user.fullName || '')
      setEmail(user.email || '')
    }
  }, [user])
  
  // Checkbox states
  const [notifSprints, setNotifSprints] = useState(true)
  const [notifRecruiter, setNotifRecruiter] = useState(true)
  const [notifCoach, setNotifCoach] = useState(false)
  const [privacyPublic, setPrivacyPublic] = useState(true)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      addToast('Name is required.', 'error')
      return
    }
    if (!email.trim()) {
      addToast('Email is required.', 'error')
      return
    }

    setIsSaving(true)
    try {
      const res = await authApi.updateProfile({ fullName: name, email })
      if (res?.success && res?.data?.user) {
        updateProfile(res.data.user)
        addToast('Configuration profile saved successfully!', 'success')
      } else {
        addToast(res?.message || 'Failed to update profile.', 'error')
      }
    } catch (err) {
      console.error('[Settings] Error saving profile:', err)
      addToast(err.response?.data?.message || 'Error saving profile configurations.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">System setup</span>
          <h2 className="font-display font-bold text-3xl mt-1">Account Settings</h2>
          <p className="text-xs text-muted mt-1">Manage configuration profiles, notifications preferences, and security settings.</p>
        </div>

        {/* Dashboard Split */}
        <div className="grid md:grid-cols-12 gap-8 items-stretch">
          
          {/* Settings Tabs Sidebar */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="glass border border-border rounded-2xl p-2.5 bg-void/25 space-y-1">
              {[
                { id: 'account', label: 'Profile Settings', icon: User },
                { id: 'password', label: 'Password & Security', icon: Lock },
                { id: 'notifications', label: 'Email Notifications', icon: Bell },
                { id: 'privacy', label: 'Privacy & Sharing', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-accent/20 to-violet/20 border border-accent/40 text-white font-semibold'
                        : 'border border-transparent text-muted hover:text-text hover:bg-surface-muted/10'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-accent' : 'text-muted'} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Quick theme card */}
            <div className="glass border border-border rounded-2xl p-4 bg-void/25 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-text uppercase tracking-wider block">Global Theme</span>
                <span className="text-[9px] text-muted">{isDark ? 'Dark Theme navy' : 'Light Theme off-white'}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Form Content Console */}
          <div className="md:col-span-8 glass border border-border rounded-2xl p-6 sm:p-8 bg-void/25 min-h-[360px] flex flex-col justify-between">
            
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'account' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-2">Profile Settings</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Preferred Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Academic Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">User Role / Track</label>
                    <input
                      type="text"
                      disabled
                      value={(() => {
                        if (!user) return 'Loading...';
                        if (user.role === 'student') {
                          const track = user.selectedCareer?.careerId?.title || 'Not Selected';
                          const comp = internship?.name || 'No Internship Active';
                          return `Student Intern — Track: ${track} (${comp})`;
                        }
                        if (user.role === 'college_representative') return `College Representative — ${user.fullName || 'Institution'}`;
                        if (user.role === 'recruiter') return `Recruiter — ${user.recruiterProfile?.companyName || 'Hiring Partner'}`;
                        if (user.role === 'admin') return 'Super Administrator';
                        return 'User';
                      })()}
                      className="w-full bg-surface-muted/20 border border-border text-xs rounded-xl py-2.5 px-3 outline-none text-muted font-medium"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-2">Change Password</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-2">Notification Channels</h3>
                  
                  <div className="space-y-3.5">
                    <div
                      onClick={() => setNotifSprints(!notifSprints)}
                      className="flex items-center gap-3 p-3 bg-void/30 hover:bg-void/50 border border-border rounded-xl cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={notifSprints}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-text block">Sprint Tasks Alerts</span>
                        <span className="text-[10px] text-muted block mt-0.5 font-normal">Notify me when milestones deadlines are close.</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setNotifRecruiter(!notifRecruiter)}
                      className="flex items-center gap-3 p-3 bg-void/30 hover:bg-void/50 border border-border rounded-xl cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={notifRecruiter}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-text block">Recruiter Discoveries</span>
                        <span className="text-[10px] text-muted block mt-0.5 font-normal">Alert me when a recruitment account bookmarks my portfolio.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-2">Privacy configurations</h3>
                  
                  <div
                    onClick={() => setPrivacyPublic(!privacyPublic)}
                    className="flex items-center gap-3 p-3 bg-void/30 hover:bg-void/50 border border-border rounded-xl cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={privacyPublic}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-text block">Public Portfolio Listing</span>
                      <span className="text-[10px] text-muted block mt-0.5 font-normal">Make my achievements, grades, and code repositories visible to hiring partners.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Action */}
              <div className="flex justify-end pt-6 border-t border-border mt-8">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  )
}
