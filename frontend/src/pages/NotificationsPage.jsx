import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { BellOff, Check, Trash2, CheckSquare, Loader2, ArrowLeft, Info, Briefcase, ShieldCheck, Calendar } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import {
  selectAllNotifications,
  fetchNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification,
} from '../store/slices/notificationsSlice.js'

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const { navigate, addToast } = useNavigation()
  const [filter, setFilter] = useState('All') // All, unread, system, recruiter

  const notifications = useSelector(selectAllNotifications)
  const { loading, page, totalPages, unreadCount } = useSelector((state) => state.notifications)

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }))
  }, [dispatch])

  const handleMarkRead = (id) => {
    dispatch(readNotification(id))
      .unwrap()
      .catch((err) => addToast(err || 'Failed to mark read', 'error'))
  }

  const handleMarkAllRead = () => {
    dispatch(readAllNotifications())
      .unwrap()
      .then(() => addToast('All notifications marked as read', 'success'))
      .catch((err) => addToast(err || 'Failed to mark all as read', 'error'))
  }

  const handleDelete = (id) => {
    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => addToast('Notification deleted', 'info'))
      .catch((err) => addToast(err || 'Failed to delete notification', 'error'))
  }

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      dispatch(fetchNotifications({ page: page + 1, limit: 20, append: true }))
    }
  }

  // Filter client-side
  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'system') return n.type === 'announcement'
    if (filter === 'recruiter') {
      return (
        n.type === 'offer' ||
        n.type === 'offer_received' ||
        n.type === 'offer_response' ||
        n.type === 'placement_accepted'
      )
    }
    return true
  })

  const getIcon = (type) => {
    switch (type) {
      case 'offer':
      case 'offer_received':
      case 'offer_response':
      case 'placement_accepted':
        return <Briefcase size={14} className="text-amber-500" />
      case 'announcement':
        return <ShieldCheck size={14} className="text-violet" />
      case 'certificate_generated':
      case 'internship_completed':
        return <Check size={14} className="text-emerald" />
      default:
        return <Info size={14} className="text-accent" />
    }
  }

  const getIconBg = (type) => {
    switch (type) {
      case 'offer':
      case 'offer_received':
      case 'offer_response':
      case 'placement_accepted':
        return 'bg-amber-500/15 border-amber-500/25 text-amber-500'
      case 'announcement':
        return 'bg-violet/15 border-violet/25 text-violet'
      case 'certificate_generated':
      case 'internship_completed':
        return 'bg-emerald/15 border-emerald/25 text-emerald'
      default:
        return 'bg-accent/15 border-accent/25 text-accent'
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Alert logs
          </span>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-3xl">Notifications Center</h2>
            <p className="text-xs text-muted mt-1">Review alerts, recruiter actions, and evaluation logs.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border hover:border-accent hover:text-accent rounded-xl text-xs font-semibold text-muted transition-colors cursor-pointer"
            >
              <CheckSquare size={13} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filters Tabs */}
        <div className="flex border-b border-border gap-6">
          {['All', 'unread', 'system', 'recruiter'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-3 text-xs uppercase font-semibold tracking-wider relative transition-colors cursor-pointer ${
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
          {loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <p className="text-xs text-muted font-semibold tracking-wider uppercase">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass border border-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-3 bg-void/25">
              <div className="p-4 bg-white/5 rounded-full border border-white/10 text-muted">
                <BellOff size={24} />
              </div>
              <h3 className="text-sm font-bold">All caught up!</h3>
              <p className="text-xs text-muted max-w-xs mx-auto">No notifications found for "{filter}".</p>
            </div>
          ) : (
            <>
              {filtered.map((n) => (
                <motion.div
                  key={n._id}
                  layout
                  className={`p-4 rounded-xl border flex gap-4 transition-all ${
                    n.isRead
                      ? 'bg-void/40 border-border opacity-70'
                      : 'bg-surface-muted/10 border-border-bright hover:border-accent/30 shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-xl border shrink-0 ${getIconBg(n.type)}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <span className={`text-xs font-bold ${n.isRead ? 'text-muted' : 'text-text'}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] text-dim flex items-center gap-1 font-mono">
                        <Calendar size={10} />
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                    
                    <div className="flex items-center gap-3 pt-2">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="text-[10px] text-accent hover:text-accent-bright font-semibold transition-colors cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="text-[10px] text-rose hover:text-rose-400 font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Load More Button */}
              {page < totalPages && (
                <div className="pt-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-4 py-2 border border-border text-xs font-semibold rounded-xl hover:bg-white/5 text-muted hover:text-text cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {loading && <Loader2 size={12} className="animate-spin" />}
                    <span>Load More Notifications</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
