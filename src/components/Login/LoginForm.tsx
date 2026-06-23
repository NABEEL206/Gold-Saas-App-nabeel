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
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br to-amber-00 rounded-2xl  overflow-hidden">
            <img
              src={logo}
              alt="Gold App Logo"
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-600 text-sm">to access Geumia</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
          {/* Email or Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address or mobile number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('emailOrPhone')}
                type="text"
                className={`w-full pl-10 pr-3 py-2.5 border ${
                  errors.emailOrPhone && touchedFields.emailOrPhone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                } rounded-lg focus:outline-none focus:ring-1`}
                placeholder="you@example.com or +91 98765 43210"
              />
            </div>
            {errors.emailOrPhone && touchedFields.emailOrPhone && (
              <p className="mt-1 text-xs text-red-500">{errors.emailOrPhone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-10 py-2.5 border ${
                  errors.password && touchedFields.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                } rounded-lg focus:outline-none focus:ring-1`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && touchedFields.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Login Error */}
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-2.5 px-4 rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2">Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Social Login Buttons - REUSED COMPONENT */}
        <div className="mt-6">
          <SocialLoginButtons 
            onGoogleClick={handleGoogleLogin}
            onFacebookClick={handleFacebookLogin}
            onLinkedInClick={handleLinkedInLogin}
            variant="login"
            isLoading={isSubmitting}
          />
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have a Geumia account?{' '}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Sign up now
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