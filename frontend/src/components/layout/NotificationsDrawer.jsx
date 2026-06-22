import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CircleAlert, Briefcase, Info, Loader2, Trash2 } from 'lucide-react'
import { useNavigation } from '../../context/NavigationContext'
import {
  selectAllNotifications,
  fetchNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification,
} from '../../store/slices/notificationsSlice.js'

export default function NotificationsDrawer() {
  const dispatch = useDispatch()
  const { notificationsOpen, setNotificationsOpen, addToast } = useNavigation()

  const notifications = useSelector(selectAllNotifications)
  const { unreadCount, page, totalPages, loading } = useSelector((state) => state.notifications)

  // Fetch initial notifications when the drawer opens
  useEffect(() => {
    if (notificationsOpen) {
      dispatch(fetchNotifications({ page: 1, limit: 20 }));
    }
  }, [notificationsOpen, dispatch]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      dispatch(fetchNotifications({ page: page + 1, limit: 20, append: true }));
    }
  };

  const handleMarkAllRead = () => {
    dispatch(readAllNotifications())
      .unwrap()
      .then(() => addToast('All notifications marked as read', 'success'))
      .catch((err) => addToast(err || 'Failed to mark all as read', 'error'));
  }

  const handleMarkRead = (id) => {
    dispatch(readNotification(id))
      .unwrap()
      .catch((err) => addToast(err || 'Failed to mark notification as read', 'error'));
  }

  const handleDelete = (id) => {
    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => addToast('Notification deleted', 'info'))
      .catch((err) => addToast(err || 'Failed to delete notification', 'error'));
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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
            className="relative w-full max-w-md h-full bg-void border-l border-border shadow-2xl flex flex-col z-10 text-text"
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
                    onClick={handleMarkAllRead}
                    className="p-2 hover:bg-white/5 rounded-lg text-[10px] text-accent hover:text-accent-bright font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-text transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <Loader2 size={24} className="text-accent animate-spin" />
                  <p className="text-xs text-muted">Retrieving alert logs...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="p-3 bg-surface-muted/50 rounded-full border border-border text-dim mb-3">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-medium text-text">All caught up!</p>
                  <p className="text-xs text-muted mt-1">You will receive alerts here when assignments or feedback are updated.</p>
                </div>
              ) : (
                <>
                  {notifications.map((n) => {
                    let NotifIcon = Info
                    let iconColor = 'text-accent bg-accent/10 border-accent/20'
                    
                    if (n.type === 'offer' || n.type === 'offer_received') {
                      NotifIcon = Briefcase
                      iconColor = 'text-amber bg-amber/10 border-amber/20'
                    } else if (n.type === 'announcement') {
                      NotifIcon = CircleAlert
                      iconColor = 'text-violet bg-violet/10 border-violet/20'
                    } else if (n.type === 'placement_accepted' || n.type === 'certificate_generated' || n.type === 'internship_completed') {
                      NotifIcon = Check
                      iconColor = 'text-emerald bg-emerald/10 border-emerald/20'
                    }

                    return (
                      <motion.div
                        key={n._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border transition-all ${
                          n.isRead
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
                              <span className={`text-xs font-semibold ${n.isRead ? 'text-muted' : 'text-text'}`}>
                                {n.title}
                              </span>
                              <span className="text-[9px] text-dim shrink-0">{formatTime(n.createdAt)}</span>
                            </div>
                            <p className="text-[11px] text-muted leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-3">
                                {!n.isRead && (
                                  <button
                                    onClick={() => handleMarkRead(n._id)}
                                    className="text-[10px] text-accent hover:text-accent-bright font-medium transition-colors cursor-pointer"
                                  >
                                    Mark Read
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleDelete(n._id)}
                                className="text-muted hover:text-rose transition-colors cursor-pointer p-1 rounded hover:bg-rose/10"
                                title="Delete Notification"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Load More Button */}
                  {page < totalPages && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-4 py-2 border border-border text-xs font-semibold rounded-xl hover:bg-white/5 text-muted hover:text-text cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {loading && <Loader2 size={12} className="animate-spin" />}
                        <span>Load More</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
