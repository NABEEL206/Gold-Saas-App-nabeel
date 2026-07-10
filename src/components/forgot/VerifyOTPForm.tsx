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
      <div className="rounded-2xl shadow-xl p-8 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>Verify OTP</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We've sent a 6-digit verification code to</p>
          <p className="font-semibold mt-1 break-all" style={{ color: 'var(--primary)' }}>{email}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-center" style={{ color: 'var(--text)' }}>
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
                  className="w-12 h-12 text-center text-xl font-semibold rounded-lg focus:outline-none focus:ring-1 transition-colors themed-transition"
                  style={{
                    border: errors.otp ? '1px solid var(--danger)' : '1px solid var(--border)',
                    background: isLoading ? 'var(--hover-bg)' : 'var(--card)',
                    color: 'var(--text)',
                    cursor: isLoading ? 'not-allowed' : 'text',
                  }}
                  autoComplete="off"
                />
              ))}
            </div>
            {errors.otp && <p className="mt-3 text-center text-xs" style={{ color: 'var(--danger)' }}>{errors.otp.message}</p>}
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Enter the 6-digit code sent to your email</p>
          </div>

          <OTPTimer seconds={resendTimer} onResend={handleResendOTP} isLoading={isLoading} />

          {generatedOTP && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <p className="text-xs text-blue-700 text-center">
                🔧 Demo Mode: Your OTP is <span className="font-bold text-blue-800">{generatedOTP}</span>
              </p>
              <p className="text-xs text-blue-600 text-center mt-1">(In production, this would be sent to your email)</p>
            </div>
          )}

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
            disabled={isLoading || otpValues.join('').length !== 6}
            className="w-full text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ background: 'var(--primary)' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Verifying OTP...</span>
              </div>
            ) : 'Verify OTP'}
          </button>

          <div className="text-center pt-2">
            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: 'var(--primary)' }}>
              <ArrowLeft className="h-4 w-4" />
              Use different email
            </Link>
          </div>
        </form>

        <div className="mt-6 p-3 rounded-lg" style={{ background: 'var(--hover-bg)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            📧 Didn't receive the code? Check your spam folder<br />
            ⏰ The OTP is valid for 10 minutes<br />
            🔄 You can request a new code after 60 seconds
          </p>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026, GoldInventory. All Rights Reserved.</p>
      </div>
    </div>
  );
};