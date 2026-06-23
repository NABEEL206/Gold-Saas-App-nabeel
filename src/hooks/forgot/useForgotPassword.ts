import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ForgotPasswordData, VerifyOTPData, ResetPasswordData } from '../../types/auth/authtype';

// Validation Schema for Forgot Password
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Validation Schema for OTP Verification
const verifyOTPSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

// Validation Schema for Reset Password
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const useForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  
  // Get email from location state (passed from previous step)
  const email = location.state?.email || '';

  // Forgot Password Form
  const forgotForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Verify OTP Form
  const verifyOTPForm = useForm<VerifyOTPData>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      email: email,
      otp: '',
    },
  });

//  const verifyOTPForm = useForm<VerifyOTPData>({
//     resolver: zodResolver(verifyOTPSchema),
//     defaultValues: {
//       email: email,
//       otp: '',
//     },
//   });  


  // Reset Password Form
  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email,
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Start resend countdown timer
  const startResendTimer = () => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Generate random OTP
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Simulate sending email with OTP
  const sendOTPEmail = async (emailAddress: string, otpCode: string): Promise<boolean> => {
    // In real application, this would call your backend API
    console.log(`=== EMAIL SENT ===`);
    console.log(`To: ${emailAddress}`);
    console.log(`Subject: Password Reset OTP - GoldInventory`);
    console.log(`Body: Your OTP for password reset is: ${otpCode}`);
    console.log(`This OTP is valid for 10 minutes.`);
    console.log(`==================`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  // Handle sending OTP to email
  const handleSendOTP = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to check if email exists
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists (simulated)
      if (data.email === 'nonexistent@example.com') {
        setError('No account found with this email address. Please check and try again.');
        setIsLoading(false);
        return;
      }
      
      // Generate new OTP
      const newOTP = generateOTP();
      setGeneratedOTP(newOTP);
      
      // Send OTP via email (simulated)
      await sendOTPEmail(data.email, newOTP);
      
      // Start resend timer (60 seconds)
      setResendTimer(60);
      startResendTimer();
      
      // Navigate to OTP verification page with email
      navigate('/verify-otp', { state: { email: data.email } });
      
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (data: VerifyOTPData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify OTP (in real app, backend would verify)
      if (data.otp !== generatedOTP) {
        setError('Invalid OTP. Please check the code and try again.');
        setIsLoading(false);
        return;
      }
      
      console.log('OTP verified successfully for:', data.email);
      
      // Navigate to reset password page
      navigate('/reset-password', { state: { email: data.email } });
      
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      setError(`Please wait ${resendTimer} seconds before requesting a new OTP.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate new OTP
      const newOTP = generateOTP();
      setGeneratedOTP(newOTP);
      
      // Send new OTP via email
      await sendOTPEmail(email, newOTP);
      
      // Reset timer
      setResendTimer(60);
      startResendTimer();
      
      // Show success message
      setError(null);
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resetting password
  const handleResetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to update password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Password reset successfully for:', data.email);
      console.log('New password set:', data.newPassword);
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update verify OTP form when email changes
  const updateVerifyOTPEmail = (newEmail: string) => {
    verifyOTPForm.setValue('email', newEmail);
    resetForm.setValue('email', newEmail);
  };

  return {
    forgotForm,
    verifyOTPForm,
    resetForm,
    isLoading,
    error,
    success,
    email,
    resendTimer,
    generatedOTP,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSendOTP,
    handleVerifyOTP,
    handleResendOTP,
    handleResetPassword,
    updateVerifyOTPEmail,
  };
};