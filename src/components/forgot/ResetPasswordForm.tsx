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
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Animation */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Reset Success!</h2>
          <p className="text-gray-600 mb-4">
            Your password has been successfully reset for
          </p>
          <p className="text-amber-600 font-semibold mb-6 break-all">{email}</p>
          <p className="text-gray-500 text-sm mb-6">
            You can now log in with your new password.
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md"
          >
            Go to Login Now
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Create New Password</h2>
          <p className="text-gray-600 text-sm">
            Create a strong new password for your account
          </p>
          <p className="text-amber-600 text-xs mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full">
            {email}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.newPassword && touchedFields.newPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                } rounded-lg focus:outline-none focus:ring-1 transition-colors`}
                placeholder="Enter your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.newPassword && touchedFields.newPassword && (
              <p className="mt-2 text-xs text-red-500">{errors.newPassword.message}</p>
            )}
            
            {/* Password Strength Indicator */}
            {newPassword && newPassword.length > 0 && strength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-semibold ${
                    strength.label === 'Strong' ? 'text-green-600' :
                    strength.label === 'Good' ? 'text-blue-600' :
                    strength.label === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{strength.label}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.confirmPassword && touchedFields.confirmPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                } rounded-lg focus:outline-none focus:ring-1 transition-colors`}
                placeholder="Confirm your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <p className="mt-2 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
            {newPassword && watch('confirmPassword') && newPassword === watch('confirmPassword') && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Password Requirements Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-3">Password Requirements:</p>
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 text-xs ${
                newPassword?.length >= 8 ? 'text-green-700' : 'text-amber-700'
              }`}>
                <span>{newPassword?.length >= 8 ? '✓' : '○'}</span> At least 8 characters long
              </li>
              <li className={`flex items-center gap-2 text-xs ${
                /[A-Z]/.test(newPassword) ? 'text-green-700' : 'text-amber-700'
              }`}>
                <span>{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span> At least one uppercase letter (A-Z)
              </li>
              <li className={`flex items-center gap-2 text-xs ${
                /[0-9]/.test(newPassword) ? 'text-green-700' : 'text-amber-700'
              }`}>
                <span>{/[0-9]/.test(newPassword) ? '✓' : '○'}</span> At least one number (0-9)
              </li>
            </ul>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-3 px-4 rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Resetting password...</span>
              </div>
            ) : (
              'Reset Password'
            )}
          </button>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-center text-gray-500">
            🔒 For security reasons, you will be logged out from all devices after password reset.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          © 2026, GoldInventory. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};