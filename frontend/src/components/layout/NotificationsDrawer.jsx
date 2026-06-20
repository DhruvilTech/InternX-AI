import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CircleAlert, Briefcase, Info } from 'lucide-react'
import { useNavigation } from '../../context/NavigationContext'

export default function NotificationsDrawer() {
  const {
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    setNotifications,
    addToast
  } = useNavigation()

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
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationsOpen(false)}
            className="fixed inset-0 bg-void/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-void border-l border-border shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="relative p-1.5 bg-violet/10 border border-violet/20 rounded-lg text-violet">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-void" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-text text-sm">Notifications</h3>
                  <p className="text-[10px] text-muted">{unreadCount} unread messages</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="p-2 hover:bg-white/5 rounded-lg text-[10px] text-accent hover:text-accent-bright font-medium flex items-center gap-1 transition-colors"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-text transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="p-3 bg-surface-muted/50 rounded-full border border-border text-dim mb-3">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-medium text-text">All caught up!</p>
                  <p className="text-xs text-muted mt-1">You will receive alerts here when assignments or feedback are updated.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  let NotifIcon = Info
                  let iconColor = 'text-accent bg-accent/10 border-accent/20'
                  if (n.category === 'recruiter') {
                    NotifIcon = Briefcase
                    iconColor = 'text-amber bg-amber/10 border-amber/20'
                  } else if (n.category === 'system') {
                    NotifIcon = CircleAlert
                    iconColor = 'text-violet bg-violet/10 border-violet/20'
                  }

                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border transition-all ${
                        n.read
                          ? 'bg-void/40 border-border opacity-70'
                          : 'bg-surface-muted/10 border-border-bright hover:border-accent/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg border shrink-0 ${iconColor}`}>
                          <NotifIcon size={14} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-xs font-semibold ${n.read ? 'text-muted' : 'text-text'}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-dim shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-muted leading-relaxed">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => toggleRead(n.id)}
                              className="text-[10px] text-accent hover:text-accent-bright font-medium transition-colors"
                            >
                              {n.read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button
                              onClick={() => deleteNotif(n.id)}
                              className="text-[10px] text-rose hover:text-rose-400 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
