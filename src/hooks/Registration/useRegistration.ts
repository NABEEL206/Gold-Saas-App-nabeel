import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RegistrationData } from '../../types/auth/authtype';

const registrationSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  country: z.string().min(1, 'Please select country'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms'),
});

export const useRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailConflictError, setEmailConflictError] = useState<string | null>(null);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { 
      companyName: '', 
      email: '', 
      phoneNumber: '', 
      password: '', 
      country: 'India', 
      agreeToTerms: false 
    },
  });

  const handleRegistration = async (data: RegistrationData) => {
    setIsLoading(true);
    setEmailConflictError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate duplicate email check
      if (data.email === 'existing@example.com') {
        setEmailConflictError('An account already exists for this email address.');
        setIsLoading(false);
        return;
      }
      
      console.log('Registration data:', data);
      navigate('/dashboard', { state: { email: data.email } });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement Google OAuth
      // Example: await signInWithGoogle();
      console.log('Google sign up initiated');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful OAuth, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement Facebook OAuth
      console.log('Facebook sign up initiated');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Facebook sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignUp = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement LinkedIn OAuth
      console.log('LinkedIn sign up initiated');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('LinkedIn sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registrationForm: form,
    showPassword,
    setShowPassword,
    isSubmitting: isLoading,
    emailConflictError,
    handleRegistration,
    handleGoogleSignUp,
    handleFacebookSignUp,
    handleLinkedInSignUp,
  };
};