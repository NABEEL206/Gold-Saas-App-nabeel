import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';
import { useForgotPassword } from '../../hooks/forgot/useForgotPassword';
import { OTPTimer } from './OTPTimer';

export const VerifyOTPForm: React.FC = () => {
  const { 
    verifyOTPForm, 
    isLoading, 
    error, 
    email,
    resendTimer,
    generatedOTP,
    handleVerifyOTP,
    handleResendOTP
  } = useForgotPassword();
  
  const { setValue, formState: { errors } } = verifyOTPForm;
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set focus to first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Show OTP in console for demo purposes
  useEffect(() => {
    if (generatedOTP) {
      console.log(`📧 Demo OTP for ${email}: ${generatedOTP}`);
    }
  }, [generatedOTP, email]);

  const handleOTPChange = (index: number, value: string) => {
    // Allow only numbers
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(0, 1);
    setOtpValues(newOtpValues);
    
    // Combine all digits
    const otp = newOtpValues.join('');
    setValue('otp', otp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Move to previous input on backspace
        inputRefs.current[index - 1]?.focus();
      } else if (otpValues[index]) {
        // Clear current input
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
        setValue('otp', newOtpValues.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d*$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtpValues = [...otpValues];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtpValues[i] = digits[i];
      }
      setOtpValues(newOtpValues);
      setValue('otp', newOtpValues.join(''));
      
      // Focus last filled input
      const lastFilledIndex = Math.min(digits.length, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Verify OTP</h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-amber-600 font-semibold mt-1 break-all">{email}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* OTP Input Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={otpValues[index]}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  disabled={isLoading}
                  className={`w-12 h-12 text-center text-xl font-semibold border ${
                    errors.otp
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                  } rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  autoComplete="off"
                />
              ))}
            </div>
            {errors.otp && (
              <p className="mt-3 text-center text-xs text-red-500">{errors.otp.message}</p>
            )}
            <p className="mt-3 text-center text-xs text-gray-400">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Resend Timer Component */}
          <OTPTimer 
            seconds={resendTimer} 
            onResend={handleResendOTP} 
            isLoading={isLoading}
          />

          {/* Demo OTP Hint (remove in production) */}
          {generatedOTP && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                🔧 Demo Mode: Your OTP is <span className="font-bold text-blue-800">{generatedOTP}</span>
              </p>
              <p className="text-xs text-blue-600 text-center mt-1">
                (In production, this would be sent to your email)
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || otpValues.join('').length !== 6}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-3 px-4 rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verifying OTP...</span>
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Back to Forgot Password */}
          <div className="text-center pt-2">
            <Link 
              to="/forgot-password" 
              className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Use different email
            </Link>
          </div>
        </form>

        {/* Help Instructions */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-center text-gray-500">
            📧 Didn't receive the code? Check your spam folder<br />
            ⏰ The OTP is valid for 10 minutes<br />
            🔄 You can request a new code after 60 seconds
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