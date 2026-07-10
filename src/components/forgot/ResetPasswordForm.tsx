import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useForgotPassword } from '../../hooks/forgot/useForgotPassword';
// ts not checked
export const ResetPasswordForm: React.FC = () => {
  const { 
    resetForm, 
    isLoading, 
    error, 
    success, 
    email,
    showNewPassword, 
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleResetPassword 
  } = useForgotPassword();
  
  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = resetForm;
  const navigate = useNavigate();
  const newPassword = watch('newPassword');

  // Password strength calculation
  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = newPassword ? calculatePasswordStrength(newPassword) : null;

  // Success State Component
  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-xl p-8 text-center themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>Password Reset Success!</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Your password has been successfully reset for</p>
          <p className="font-semibold mb-6 break-all" style={{ color: 'var(--primary)' }}>{email}</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>You can now log in with your new password.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full text-white font-medium py-3 rounded-lg transition-all shadow-md"
            style={{ background: 'var(--primary)' }}
          >Go to Login Now</button>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Redirecting automatically in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl shadow-xl p-8 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>Create New Password</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create a strong new password for your account</p>
          <p className="text-xs mt-2 inline-block px-3 py-1 rounded-full" style={{ color: 'var(--primary)', background: 'var(--active-bg)' }}>{email}</p>
        </div>

        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-1 themed-transition"
                style={{
                  border: errors.newPassword && touchedFields.newPassword ? '1px solid var(--danger)' : '1px solid var(--border)',
                  background: 'var(--card)', color: 'var(--text)',
                }}
                placeholder="Enter your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showNewPassword ? <EyeOff className="h-5 w-5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
            {errors.newPassword && touchedFields.newPassword && (
              <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{errors.newPassword.message}</p>
            )}
            {newPassword && newPassword.length > 0 && strength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Password strength:</span>
                  <span className={`text-xs font-semibold ${
                    strength.label === 'Strong' ? 'text-green-600' :
                    strength.label === 'Good' ? 'text-blue-600' :
                    strength.label === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{strength.label}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-1 themed-transition"
                style={{
                  border: errors.confirmPassword && touchedFields.confirmPassword ? '1px solid var(--danger)' : '1px solid var(--border)',
                  background: 'var(--card)', color: 'var(--text)',
                }}
                placeholder="Confirm your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showConfirmPassword ? <EyeOff className="h-5 w-5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{errors.confirmPassword.message}</p>
            )}
            {newPassword && watch('confirmPassword') && newPassword === watch('confirmPassword') && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Password Requirements:</p>
            <ul className="space-y-2">
              {[
                { met: newPassword?.length >= 8, label: 'At least 8 characters long' },
                { met: /[A-Z]/.test(newPassword), label: 'At least one uppercase letter (A-Z)' },
                { met: /[0-9]/.test(newPassword), label: 'At least one number (0-9)' },
              ].map((req, i) => (
                <li key={i} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-600' : ''}`} style={!req.met ? { color: 'var(--text-secondary)' } : {}}>
                  <span>{req.met ? '✓' : '○'}</span> {req.label}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)' }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: 'var(--danger)' }} />
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
                <span>Resetting password...</span>
              </div>
            ) : 'Reset Password'}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: 'var(--primary)' }}>
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>

        <div className="mt-6 p-3 rounded-lg" style={{ background: 'var(--hover-bg)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            🔒 For security reasons, you will be logged out from all devices after password reset.
          </p>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026, GoldInventory. All Rights Reserved.</p>
      </div>
    </div>
  );
};