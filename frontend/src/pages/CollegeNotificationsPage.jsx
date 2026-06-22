import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAllNotifications,
  fetchNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification,
} from '../store/slices/notificationsSlice.js';
import { useNavigation } from '../context/NavigationContext';
import { Bell, BellOff, CheckCircle, Clock, Calendar, Mail, User, Info, Check, Trash2, CheckSquare, Loader2 } from 'lucide-react';

export default function CollegeNotificationsPage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();

  const notifications = useSelector(selectAllNotifications);
  const { loading, page, totalPages, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    dispatch(readNotification(id))
      .unwrap()
      .catch((err) => addToast(err || 'Failed to mark read', 'error'));
  };

  const handleMarkAllRead = () => {
    dispatch(readAllNotifications())
      .unwrap()
      .then(() => addToast('All notifications marked as read', 'success'))
      .catch((err) => addToast(err || 'Failed to mark all as read', 'error'));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => addToast('Notification deleted', 'info'))
      .catch((err) => addToast(err || 'Failed to delete notification', 'error'));
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      dispatch(fetchNotifications({ page: page + 1, limit: 20, append: true }));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow spots */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Bell size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold">College Notifications</h1>
              <p className="text-xs text-muted">Activity feeds and placement status logs for your university portal.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Official Broadcast logs
          </span>
        </div>

        {/* Action Header */}
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border hover:border-accent hover:text-accent rounded-xl text-xs font-semibold text-muted transition-colors cursor-pointer"
            >
              <CheckSquare size={13} />
              <span>Mark all read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted font-semibold tracking-wider uppercase">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass border border-border p-12 text-center text-xs text-muted rounded-2xl flex flex-col items-center justify-center space-y-3 bg-void/25">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 text-muted">
              <BellOff size={24} />
            </div>
            <h3 className="text-sm font-bold text-text">All caught up!</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">No notifications logs recorded in this cohort yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {notifications.map((n) => {
              const isRead = n.isRead;
              return (
                <div 
                  key={n._id}
                  onClick={() => {
                    if (n.senderId?._id) {
                      navigate(`college/students/${n.senderId._id}`);
                    } else {
                      navigate('college/placements');
                    }
                  }}
                  className={`glass p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                    isRead 
                      ? 'border-border/30 bg-void/10 opacity-70' 
                      : 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/5 hover:border-accent'
                  }`}
                >
                  {/* Icon block depending on type */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    n.type === 'placement_accepted'
                      ? 'bg-emerald/10 border-emerald/20 text-emerald'
                      : n.type === 'offer_received'
                      ? 'bg-accent/10 border-accent/20 text-accent'
                      : 'bg-indigo-400/10 border-indigo-400/20 text-indigo-400'
                  }`}>
                    {n.type === 'placement_accepted' ? (
                      <CheckCircle size={16} />
                    ) : n.type === 'offer_received' ? (
                      <Mail size={16} />
                    ) : (
                      <Info size={16} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold ${isRead ? 'text-muted' : 'text-text font-semibold'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[9px] text-muted font-mono flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {n.message}
                    </p>
                    
                    {/* Sender details if populated */}
                    {n.senderId && (
                      <div className="flex items-center gap-2 pt-2 text-[10px] text-muted">
                        <span className="flex items-center gap-1">
                          <User size={10} className="text-accent" />
                          {n.senderId.fullName}
                        </span>
                        <span>·</span>
                        <span>{n.senderId.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 self-center">
                    {!isRead && (
                      <button
                        onClick={(e) => handleMarkRead(e, n._id)}
                        className="p-1 rounded bg-white/5 border border-border text-muted hover:text-text hover:border-accent transition-all cursor-pointer"
                        title="Mark as Read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="p-1 rounded bg-white/5 border border-border text-muted hover:text-rose hover:border-rose/30 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Load More Pagination */}
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
          </div>
        )}
      </div>
    </div>
  );
}
