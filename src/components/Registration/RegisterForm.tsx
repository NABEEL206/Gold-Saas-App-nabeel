import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Phone, Building } from 'lucide-react';
import { useRegistration } from '../../hooks/Registration/useRegistration';
import { SocialLoginButtons } from '../common/SocialLoginButtons';

export const RegisterForm: React.FC = () => {
  const { 
    registrationForm, 
    showPassword, 
    setShowPassword, 
    isSubmitting, 
    emailConflictError, 
    handleRegistration,
    handleGoogleSignUp,
    handleFacebookSignUp,
    handleLinkedInSignUp,
  } = useRegistration();
  
  const { register, handleSubmit, formState: { errors, touchedFields }, setValue } = registrationForm;

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Let's get started</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your gold inventory & accounting efficiently</p>
        </div>

        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Company Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              <input
                {...register('companyName')}
                className="w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none themed-transition"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                placeholder="Your jewelry business name"
              />
            </div>
            {errors.companyName && touchedFields.companyName && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.companyName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none themed-transition"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                placeholder="admin@yourbusiness.com"
              />
            </div>
            {emailConflictError && (
              <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)' }}>
                <p className="text-sm" style={{ color: 'var(--danger)' }}>{emailConflictError}</p>
                <div className="mt-2 flex gap-3">
                  <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Sign in →</Link>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
                  <button type="button" onClick={() => setValue('email', '')} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Use different email</button>
                </div>
              </div>
            )}
            {errors.email && touchedFields.email && !emailConflictError && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              <input
                {...register('phoneNumber')}
                type="tel"
                className="w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none themed-transition"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                placeholder="+91 98765 43210"
              />
            </div>
            {errors.phoneNumber && touchedFields.phoneNumber && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none themed-transition"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                placeholder="Create a strong password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
                {showPassword ? <EyeOff className="h-5 w-5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
            {errors.password && touchedFields.password && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Country</label>
            <select
              {...register('country')}
              className="w-full px-3 py-2 rounded-lg focus:outline-none themed-transition"
              style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
            >
              <option value="India">India</option>
            </select>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              className="mt-1 h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              style={{ borderColor: 'var(--border)' }}
            />
            <label className="text-sm" style={{ color: 'var(--text)' }}>
              I agree to the <Link to="/terms" className="font-medium" style={{ color: 'var(--primary)' }}>Terms of Service</Link> and{' '}
              <Link to="/privacy" className="font-medium" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.agreeToTerms.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            style={{ background: 'var(--primary)' }}
          >
            {isSubmitting ? 'Creating account...' : 'Create your account'}
          </button>
        </form>

        <div className="mt-8">
          <SocialLoginButtons onGoogleClick={handleGoogleSignUp} onFacebookClick={handleFacebookSignUp} onLinkedInClick={handleLinkedInSignUp} variant="signup" isLoading={isSubmitting} />
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--primary)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};