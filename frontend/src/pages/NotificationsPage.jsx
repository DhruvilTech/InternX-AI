import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, X, ShieldCheck, Briefcase, Mail, Info, RefreshCw } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

export default function NotificationsPage() {
  const { notifications, setNotifications, addToast } = useNavigation()
  const [filter, setFilter] = useState('All') // All, unread, system, recruiter

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    addToast('All notifications marked as read', 'success')
  }

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const deleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    addToast('Notification deleted', 'info')
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'system') return n.category === 'system'
    if (filter === 'recruiter') return n.category === 'recruiter'
    return true
  })

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Alert logs</span>
            <h2 className="font-display font-bold text-3xl mt-1">Notifications Center</h2>
            <p className="text-xs text-muted mt-1">Review alerts, recruiter actions, and evaluation logs.</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={markAllRead}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border rounded-xl text-xs font-semibold text-text hover:border-border-strong hover:bg-surface-muted/10 transition-colors cursor-pointer"
            >
              <Check size={13} />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex border-b border-border gap-6">
          {['All', 'unread', 'system', 'recruiter'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-3 text-xs uppercase font-semibold tracking-wider relative transition-colors ${
                filter === f ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              {f}
              {filter === f && (
                <motion.div
                  layoutId="notifFilterUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* List of alerts */}
        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted border border-dashed border-border rounded-2xl">
              No notifications logs found for "{filter}".
            </div>
          ) : (
            filtered.map((n) => {
              let Icon = Info
              let badgeColor = 'text-accent bg-accent/15 border-accent/25'
              if (n.category === 'recruiter') {
                Icon = Briefcase
                badgeColor = 'text-amber bg-amber/15 border-amber/25'
              } else if (n.category === 'system') {
                Icon = ShieldCheck
                badgeColor = 'text-violet bg-violet/15 border-violet/25'
              }

              return (
                <motion.div
                  key={n.id}
                  className={`p-4 rounded-xl border flex gap-4 transition-all ${
                    n.read
                      ? 'bg-void/40 border-border opacity-70'
                      : 'bg-surface-muted/10 border-border-bright hover:border-accent/30 shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-xl border shrink-0 ${badgeColor}`}>
                    <Icon size={16} />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <span className={`text-xs font-bold ${n.read ? 'text-muted' : 'text-text'}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] text-dim">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                    
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => toggleRead(n.id)}
                        className="text-[10px] text-accent hover:text-accent-bright font-semibold transition-colors"
                      >
                        {n.read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={() => deleteNotif(n.id)}
                        className="text-[10px] text-rose hover:text-rose-400 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
