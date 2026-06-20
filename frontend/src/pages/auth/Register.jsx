import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, School, Briefcase, ShieldAlert, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import AuthLayout from '../../components/AuthLayout.jsx';

// Role-specific validation schemas
const studentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  collegeName: z.string().min(2, 'College name is required'),
  course: z.string().min(2, 'Course name is required'),
  year: z.coerce.number().min(1, 'Year must be positive').max(6, 'Invalid academic year'),
  skills: z.string().optional(),
});

const collegeSchema = z.object({
  collegeName: z.string().min(2, 'College name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  collegeCode: z.string().min(2, 'College code is required'),
  website: z.string().url('Please enter a valid website URL (starting with http/https)'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
});

const recruiterSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  industry: z.string().min(2, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  website: z.string().url('Please enter a valid website URL (starting with http/https)'),
});

const adminSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // null, student, college, recruiter, admin
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return schema based on selected role
  const getSchemaForRole = () => {
    switch (selectedRole) {
      case 'student': return studentSchema;
      case 'college': return collegeSchema;
      case 'recruiter': return recruiterSchema;
      case 'admin': return adminSchema;
      default: return z.object({});
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(getSchemaForRole()),
    mode: 'onSubmit',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, role: selectedRole };
      
      // Parse skills text to array if student role is selected
      if (selectedRole === 'student' && data.skills) {
        payload.skills = data.skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s !== '');
      }

      await signup(payload);
      toast.success('Registration successful! Welcome to InternX AI.');
      
      if (selectedRole === 'student') navigate('/student/dashboard');
      else if (selectedRole === 'college') navigate('/college/dashboard');
      else if (selectedRole === 'recruiter') navigate('/recruiter/dashboard');
      else if (selectedRole === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    reset();
  };

  // Card layouts configuration
  const roleCards = [
    { id: 'student', title: 'Student', desc: 'Accelerate career paths with real AI sprints', icon: User, color: 'text-accent border-accent/20' },
    { id: 'college', title: 'College', desc: 'Accredit & monitor student programs', icon: School, color: 'text-violet border-violet/20' },
    { id: 'recruiter', title: 'Recruiter', desc: 'Source and hire verified tech talents', icon: Briefcase, color: 'text-emerald-400 border-emerald-400/20' },
    { id: 'admin', title: 'System Admin', desc: 'Audit configurations and platform users', icon: ShieldAlert, color: 'text-amber-400 border-amber-400/20' },
  ];

  if (!selectedRole) {
    return (
      <AuthLayout title="Choose Your Profile" subtitle="Select your role to start collaborating on InternX AI">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(card.id)}
                className={`p-5 text-left rounded-xl border bg-void/50 hover:bg-surface-muted/10 transition-colors flex flex-col items-start cursor-pointer border-border`}
              >
                <div className={`p-2.5 rounded-lg bg-surface border ${card.color} mb-4`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-text font-display">{card.title}</h3>
                <p className="text-[10px] text-muted mt-1 leading-relaxed">{card.desc}</p>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted font-medium mt-8">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-accent hover:text-accent/80 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </AuthLayout>
    );
  }

  // Display selected form based on role
  return (
    <AuthLayout
      title={`Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`}
      subtitle="Complete information to gain access to the platform"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Core fields shared by all roles */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@organization.com"
            {...register('email')}
            className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
              errors.email ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              {...register('password')}
              className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 pr-12 ${
                errors.password ? 'border-rose-500/50 focus:ring-rose-500/25' : 'border-border focus:border-accent'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[10px] text-rose-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Dynamic Fields - Student */}
        {selectedRole === 'student' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...register('fullName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                  errors.fullName ? 'border-rose-500/50' : 'border-border'
                }`}
              />
              {errors.fullName && <p className="mt-1 text-[10px] text-rose-400">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                College Name
              </label>
              <input
                type="text"
                placeholder="E.g. Stanford University"
                {...register('collegeName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                  errors.collegeName ? 'border-rose-500/50' : 'border-border'
                }`}
              />
              {errors.collegeName && <p className="mt-1 text-[10px] text-rose-400">{errors.collegeName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Course
                </label>
                <input
                  type="text"
                  placeholder="E.g. B.Tech CS"
                  {...register('course')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                    errors.course ? 'border-rose-500/50' : 'border-border'
                  }`}
                />
                {errors.course && <p className="mt-1 text-[10px] text-rose-400">{errors.course.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Current Year
                </label>
                <input
                  type="number"
                  placeholder="3"
                  {...register('year')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                    errors.year ? 'border-rose-500/50' : 'border-border'
                  }`}
                />
                {errors.year && <p className="mt-1 text-[10px] text-rose-400">{errors.year.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Skills (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, Python"
                {...register('skills')}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300"
              />
            </div>
          </>
        )}

        {/* Dynamic Fields - College */}
        {selectedRole === 'college' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                College Name
              </label>
              <input
                type="text"
                placeholder="Stanford University"
                {...register('collegeName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                  errors.collegeName ? 'border-rose-500/50' : 'border-border'
                }`}
              />
              {errors.collegeName && <p className="mt-1 text-[10px] text-rose-400">{errors.collegeName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  College Code
                </label>
                <input
                  type="text"
                  placeholder="STAN-002"
                  {...register('collegeCode')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                    errors.collegeCode ? 'border-rose-500/50' : 'border-border'
                  }`}
                />
                {errors.collegeCode && <p className="mt-1 text-[10px] text-rose-400">{errors.collegeCode.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="John Miller"
                  {...register('contactPerson')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                    errors.contactPerson ? 'border-rose-500/50' : 'border-border'
                  }`}
                />
                {errors.contactPerson && <p className="mt-1 text-[10px] text-rose-400">{errors.contactPerson.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Official Website
              </label>
              <input
                type="text"
                placeholder="https://stanford.edu"
                {...register('website')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                  errors.website ? 'border-rose-500/50' : 'border-border'
                }`}
              />
              {errors.website && <p className="mt-1 text-[10px] text-rose-400">{errors.website.message}</p>}
            </div>
          </>
        )}

        {/* Dynamic Fields - Recruiter */}
        {selectedRole === 'recruiter' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                placeholder="TechCorp Solutions"
                {...register('companyName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                  errors.companyName ? 'border-rose-500/50' : 'border-border'
                }`}
              />
              {errors.companyName && <p className="mt-1 text-[10px] text-rose-400">{errors.companyName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="E.g. FinTech"
                  {...register('industry')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                    errors.industry ? 'border-rose-500/50' : 'border-border'
                  }`}
                />
                {errors.industry && <p className="mt-1 text-[10px] text-rose-400">{errors.industry.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Company Size
                </label>
                <input
                  type="text"
                  placeholder="E.g. 50-200"
                  {...register('companySize')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                    errors.companySize ? 'border-rose-500/50' : 'border-border'
                  }`}
                />
                {errors.companySize && <p className="mt-1 text-[10px] text-rose-400">{errors.companySize.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Company Website
              </label>
              <input
                type="text"
                placeholder="https://techcorp.com"
                {...register('website')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                  errors.website ? 'border-rose-500/50' : 'border-border'
                }`}
              />
              {errors.website && <p className="mt-1 text-[10px] text-rose-400">{errors.website.message}</p>}
            </div>
          </>
        )}

        {/* Dynamic Fields - Admin */}
        {selectedRole === 'admin' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Admin Name"
              {...register('fullName')}
              className={`w-full px-4 py-2.5 rounded-xl border bg-void/50 text-text placeholder-muted/60 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all duration-300 ${
                errors.fullName ? 'border-rose-500/50' : 'border-border'
              }`}
            />
            {errors.fullName && <p className="mt-1 text-[10px] text-rose-400">{errors.fullName.message}</p>}
          </div>
        )}

        {/* Form controls */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleBackToRoles}
            className="flex items-center justify-center p-2.5 rounded-xl border border-border bg-surface text-muted hover:text-text hover:border-border-strong transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-widest text-white rounded-xl bg-gradient-to-r from-accent to-violet shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all duration-300 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={13} />
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Register Now</span>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
