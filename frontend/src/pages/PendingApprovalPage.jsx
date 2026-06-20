import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

export default function PendingApprovalPage() {
  const { user, logout, fetchCurrentUser, addToast } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const updatedUser = await fetchCurrentUser();
      const isApproved =
        (updatedUser.role === 'student' && updatedUser.isVerified) ||
        (updatedUser.role === 'college' && updatedUser.isCollegeVerified) ||
        (updatedUser.role === 'recruiter' && updatedUser.isRecruiterVerified);

      if (isApproved) {
        window.location.reload(); // Refresh the page to load the dashboard
      } else {
        // Find addToast fallback
        if (typeof addToast === 'function') {
          addToast('Your account is still pending audit verification.', 'info');
        } else {
          alert('Your account is still pending audit verification.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-void flex items-center justify-center p-4 relative overflow-hidden text-text">
      {/* Glow layers */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass border border-border p-8 rounded-2xl text-center space-y-6 glow-accent relative z-10"
      >
        <div className="relative mx-auto w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
          <Clock size={32} className="animate-pulse" />
          <ShieldAlert size={14} className="absolute -bottom-1 -right-1 text-amber-500 bg-void border border-border rounded-full p-0.5" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl bg-gradient-to-r from-text via-text-secondary to-accent bg-clip-text text-transparent">
            Verification Pending
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Welcome, <span className="text-text font-semibold">{user?.fullName || user?.collegeName || user?.companyName || 'User'}</span>!
            Your registration is currently undergoing manual audit review.
          </p>
        </div>

        <div className="p-4 bg-void/60 border border-border/60 rounded-xl text-[11px] text-muted text-left space-y-2 leading-relaxed">
          <span className="font-bold text-text uppercase tracking-wider block text-[9px]">Status Information:</span>
          <p>• <strong>Account Role:</strong> <span className="font-mono text-accent-bright uppercase">{user?.role}</span></p>
          <p>• <strong>Credentials:</strong> Submitted for admin inspection.</p>
          <p>• <strong>Timeline:</strong> Verification typically takes under 24 hours. You will gain dashboard access once verified.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-accent/20 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            <span>Check Status</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-void/50 hover:bg-white/5 text-muted hover:text-text text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
          >
            <LogOut size={14} />
            <span>Log Out & Exit</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
