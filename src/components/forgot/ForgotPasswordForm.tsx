import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Info } from 'lucide-react';
import { useForgotPassword } from '../../hooks/forgot/useForgotPassword';

export const ForgotPasswordForm: React.FC = () => {
  const { forgotForm, isLoading, error, handleSendOTP } = useForgotPassword();
  const { register, handleSubmit, formState: { errors, touchedFields } } = forgotForm;

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl shadow-xl p-8 themed-transition"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🔐</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>Forgot password?</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't worry! Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-1 themed-transition"
                style={{
                  border: errors.email && touchedFields.email ? '1px solid var(--danger)' : '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                }}
                placeholder="your@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && touchedFields.email && (
              <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>
            )}
            <div className="mt-2 flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                We'll send a 6-digit verification code to this email address.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)' }}>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ color: 'var(--danger)' }}>⚠️</span>
                <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ background: 'var(--primary)' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Sending OTP...</span>
              </div>
            ) : 'Send OTP'}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: 'var(--primary)' }}>
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Having trouble?{' '}
            <Link to="/contact-support" style={{ color: 'var(--primary)' }}>Contact support</Link>
          </p>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026, GoldInventory. All Rights Reserved.</p>
      </div>
    </div>
  );
};