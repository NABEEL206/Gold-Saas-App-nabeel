import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Info } from 'lucide-react';
import { useForgotPassword } from '../../hooks/forgot/useForgotPassword';

export const ForgotPasswordForm: React.FC = () => {
  const { forgotForm, isLoading, error, handleSendOTP } = useForgotPassword();
  const { register, handleSubmit, formState: { errors, touchedFields } } = forgotForm;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🔐</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Forgot password?</h2>
          <p className="text-gray-600 text-sm">
            Don't worry! Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className={`w-full pl-10 pr-3 py-3 border ${
                  errors.email && touchedFields.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                } rounded-lg focus:outline-none focus:ring-1 transition-colors`}
                placeholder="your@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && touchedFields.email && (
              <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>
            )}
            <div className="mt-2 flex items-start gap-2">
              <Info className="h-3 w-3 text-gray-400 mt-0.5" />
              <p className="text-xs text-gray-500">
                We'll send a 6-digit verification code to this email address.
              </p>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-600 text-sm">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
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
                <span>Sending OTP...</span>
              </div>
            ) : (
              'Send OTP'
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

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Having trouble?{' '}
            <Link to="/contact-support" className="text-amber-600 hover:text-amber-700">
              Contact support
            </Link>
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