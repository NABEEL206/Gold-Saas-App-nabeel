import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { LoginData } from '../../types/auth/authtype';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or mobile number is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const useLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate authentication check
      if (data.emailOrPhone === 'test@example.com' && data.password === 'password123') {
        console.log('Login successful:', data);
        navigate('/dashboard');
      } else {
        setLoginError('Invalid email/mobile or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Google login initiated');
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Facebook login initiated');
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Facebook login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      setIsLoading(true);
      console.log('LinkedIn login initiated');
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('LinkedIn login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginForm: form,
    showPassword,
    setShowPassword,
    isSubmitting: isLoading,
    loginError,
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    handleLinkedInLogin,
  };
};