import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useLogin } from '../../hooks/Login/useLogin';
import { SocialLoginButtons } from '../common/SocialLoginButtons';
import logo from '../../assets/logo/gold-app-icon.png';

export const LoginForm: React.FC = () => {
  const {
    loginForm,
    showPassword,
    setShowPassword,
    isSubmitting,
    loginError,
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    handleLinkedInLogin,
  } = useLogin();

  const { register, handleSubmit, formState: { errors, touchedFields } } = loginForm;

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl shadow-xl p-8 themed-transition"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br to-amber-00 rounded-2xl overflow-hidden">
              <img src={logo} alt="Gold App Logo" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Sign in</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>to access Geumia</p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
          {/* Email or Mobile */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              Email address or mobile number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <input
                {...register('emailOrPhone')}
                type="text"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 themed-transition"
                style={{
                  border: errors.emailOrPhone && touchedFields.emailOrPhone
                    ? '1px solid var(--danger)'
                    : '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                }}
                placeholder="you@example.com or +91 98765 43210"
              />
            </div>
            {errors.emailOrPhone && touchedFields.emailOrPhone && (
              <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.emailOrPhone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-1 themed-transition"
                style={{
                  border: errors.password && touchedFields.password
                    ? '1px solid var(--danger)'
                    : '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                }}
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showPassword
                  ? <EyeOff className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  : <Eye className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
            {errors.password && touchedFields.password && (
              <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input {...register('rememberMe')} type="checkbox" className="h-4 w-4 text-amber-600 focus:ring-amber-500 rounded" style={{ borderColor: 'var(--border)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
              Forgot password?
            </Link>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)' }}>
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ background: 'var(--primary)' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span className="ml-2">Signing in...</span>
              </div>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="mt-6">
          <SocialLoginButtons onGoogleClick={handleGoogleLogin} onFacebookClick={handleFacebookLogin} onLinkedInClick={handleLinkedInLogin} variant="login" isLoading={isSubmitting} />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have a Geumia account?{' '}
            <Link to="/register" className="font-medium" style={{ color: 'var(--primary)' }}>Sign up now</Link>
          </p>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026, GoldInventory. All Rights Reserved.</p>
      </div>
    </div>
  );
};