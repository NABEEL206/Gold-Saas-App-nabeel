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
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's get started</h1>
          <p className="text-gray-600">Manage your gold inventory & accounting efficiently</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-5">
          {/* Company Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input 
                {...register('companyName')} 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 focus:outline-none" 
                placeholder="Your jewelry business name" 
              />
            </div>
            {errors.companyName && touchedFields.companyName && (
              <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input 
                {...register('email')} 
                type="email" 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 focus:outline-none" 
                placeholder="admin@yourbusiness.com" 
              />
            </div>
            
            {/* Email Conflict Error */}
            {emailConflictError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{emailConflictError}</p>
                <div className="mt-2 flex gap-3">
                  <Link to="/login" className="text-sm text-amber-600 font-medium hover:underline">Sign in →</Link>
                  <span className="text-sm text-gray-400">or</span>
                  <button type="button" onClick={() => setValue('email', '')} className="text-sm text-amber-600 font-medium hover:underline">
                    Use different email
                  </button>
                </div>
              </div>
            )}
            
            {/* Email Validation Error */}
            {errors.email && touchedFields.email && !emailConflictError && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input 
                {...register('phoneNumber')} 
                type="tel" 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 focus:outline-none" 
                placeholder="+91 98765 43210" 
              />
            </div>
            {errors.phoneNumber && touchedFields.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input 
                {...register('password')} 
                type={showPassword ? 'text' : 'password'} 
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 focus:outline-none" 
                placeholder="Create a strong password" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-2.5"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.password && touchedFields.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Country Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select {...register('country')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 focus:outline-none bg-white">
              <option value="India">India</option>
  
            </select>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2">
            <input {...register('agreeToTerms')} type="checkbox" className="mt-1 h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500" />
            <label className="text-sm text-gray-700">
              I agree to the <Link to="/terms" className="text-amber-600 hover:text-amber-700 font-medium">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {isSubmitting ? 'Creating account...' : 'Create your account'}
          </button>
        </form>

        {/* Social Login Buttons - REUSED COMPONENT */}
        <div className="mt-8">
          <SocialLoginButtons 
            onGoogleClick={handleGoogleSignUp}
            onFacebookClick={handleFacebookSignUp}
            onLinkedInClick={handleLinkedInSignUp}
            variant="signup"
            isLoading={isSubmitting}
          />
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-amber-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};