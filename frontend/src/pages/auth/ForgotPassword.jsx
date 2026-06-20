import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import * as authApi from '../../api/authApi.js';
import AuthLayout from '../../components/AuthLayout.jsx';

// Validate email schema
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(data);
      toast.success('Reset token generated successfully!');
      
      const token = res.data?.resetToken || res.resetToken;
      if (token) {
        setResetToken(token);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error occurred. Please verify email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Recover Password" subtitle="Enter your email to receive a password reset token">
      {resetToken ? (
        <div className="space-y-5 text-center">
          <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 text-left space-y-2">
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Dev Reset Token Generated:</h4>
            <p className="text-xs font-mono break-all select-all text-text bg-void/50 p-2.5 rounded border border-border">
              {resetToken}
            </p>
            <p className="text-[10px] text-muted">
              Copy this token and use it on the reset page. In production, this token will be emailed.
            </p>
          </div>
          <Link
            to={`/reset-password?token=${resetToken}`}
            className="w-full flex items-center justify-center py-2.5 px-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl bg-gradient-to-r from-accent to-violet shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Go to Reset Page
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@organization.com"
              {...register('email')}
              className={`w-full px-4 py-3 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                errors.email ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl bg-gradient-to-r from-accent to-violet shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-300 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={13} />
                <span>Sending...</span>
              </>
            ) : (
              <span>Request Token</span>
            )}
          </button>

          <p className="text-center text-xs text-muted font-medium mt-6">
            Back to{' '}
            <Link
              to="/login"
              className="font-bold text-accent hover:text-accent/80 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
