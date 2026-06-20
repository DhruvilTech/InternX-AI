import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import AuthLayout from '../../components/AuthLayout.jsx';

// Validate credentials schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await login({ email: data.email, password: data.password });
      toast.success('Welcome back to InternX AI!');
      
      const role = res.user?.role || res.data?.user?.role;
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'college' || role === 'college_admin') {
        navigate('/college/dashboard');
      } else if (role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to resume your AI internship journey">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@university.edu"
            {...register('email')}
            className={`w-full px-4 py-3 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
              errors.email ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
            }`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-4 py-3 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 pr-12 ${
                errors.password ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
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
          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-border bg-void/50 text-accent focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all cursor-pointer accent-accent"
            />
            <span className="text-xs font-semibold text-muted group-hover:text-text transition-colors">
              Remember Me
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl bg-gradient-to-r from-accent to-violet shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all duration-300 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={13} />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        <p className="text-center text-xs text-muted font-medium mt-6">
          New to InternX?{' '}
          <Link
            to="/register"
            className="font-bold text-accent hover:text-accent/80 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
