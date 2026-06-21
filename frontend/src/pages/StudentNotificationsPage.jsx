import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, readNotification } from '../store/slices/notificationsSlice.js';
import { Bell, BellOff, Check, ArrowLeft, Calendar, Mail, FileText, Award } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function StudentNotificationsPage() {
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(readNotification(id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'offer':
        return <Award size={14} className="text-amber-500" />;
      case 'offer_response':
        return <Check size={14} className="text-emerald" />;
      case 'message':
      default:
        return <Mail size={14} className="text-accent" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'offer':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      case 'offer_response':
        return 'bg-emerald/10 border-emerald/20 text-emerald';
      case 'message':
      default:
        return 'bg-accent/10 border-accent/20 text-accent';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('student/dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Notification Center
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-text">Notification Alerts</h2>
          <p className="text-xs text-muted">Stay updated with internship offers, corporate requests, and simulated program alerts.</p>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted font-semibold tracking-wider uppercase">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-void/25">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 text-muted">
              <BellOff size={24} />
            </div>
            <h3 className="text-sm font-bold">All caught up!</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">No notifications recorded yet. We will notify you here when recruiters send offers or outreach updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`glass border rounded-2xl p-5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  n.isRead
                    ? 'bg-void/10 border-border/50 opacity-60'
                    : 'bg-void/40 border-border hover:border-accent/40 shadow-lg shadow-accent/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl border shrink-0 ${getIconBg(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-semibold ${n.isRead ? 'text-muted' : 'text-text'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="px-1.5 py-0.5 rounded bg-accent/20 border border-accent/30 text-[8px] text-accent-bright font-bold uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed max-w-2xl">{n.message}</p>
                    
                    <div className="flex items-center gap-1 text-[10px] text-muted/80 font-mono">
                      <Calendar size={10} />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="w-full sm:w-auto shrink-0 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong text-xs font-semibold rounded-xl text-muted hover:text-text cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check size={12} />
                    <span>Mark as Read</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
