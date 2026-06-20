import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import * as authApi from '../../api/authApi.js';
import AuthLayout from '../../components/AuthLayout.jsx';

// Validate reset schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      newPassword: '',
    },
  });

  // Extract token from URL search query on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setValue('token', tokenParam);
    }
  }, [location, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(data);
      toast.success('Password updated successfully! Log in to continue.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update password. Token expired or invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password to secure your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Reset Token
          </label>
          <input
            type="text"
            placeholder="Paste generated token"
            {...register('token')}
            className={`w-full px-4 py-3 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
              errors.token ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
            }`}
          />
          {errors.token && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.token.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('newPassword')}
              className={`w-full px-4 py-3 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 pr-12 ${
                errors.newPassword ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.newPassword.message}</p>
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
              <span>Updating...</span>
            </>
          ) : (
            <span>Update Password</span>
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
    </AuthLayout>
  );
}
