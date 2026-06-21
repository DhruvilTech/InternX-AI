import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCollegeNotifications, markNotificationRead } from '../store/slices/collegeNotificationSlice.js';
import { useNavigation } from '../context/NavigationContext';
import { Bell, CheckCircle, Clock, Calendar, Mail, User, Info, Check } from 'lucide-react';

export default function CollegeNotificationsPage() {
  const dispatch = useDispatch();
  const { navigate } = useNavigation();

  const { notifications, loading, error } = useSelector((state) => state.collegeNotifications);

  useEffect(() => {
    dispatch(fetchCollegeNotifications());
  }, [dispatch]);

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
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

        {/* Notifications List */}
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
                    <h3 className={`text-xs font-bold ${isRead ? 'text-text' : 'text-text font-semibold'}`}>
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

                {/* Mark as Read button */}
                {!isRead && (
                  <button
                    onClick={(e) => handleMarkRead(e, n._id)}
                    className="p-1 rounded bg-white/5 border border-border text-muted hover:text-text hover:border-accent transition-all cursor-pointer self-center"
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })}

          {notifications.length === 0 && !loading && (
            <div className="glass border border-border p-12 text-center text-xs text-muted rounded-2xl">
              No notifications logs recorded in this cohort yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
