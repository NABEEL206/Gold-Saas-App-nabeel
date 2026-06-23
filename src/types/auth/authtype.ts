export interface RegistrationData {
  companyName: string;
  email: string;
  phoneNumber: string;
  password: string;
  country: string;
  agreeToTerms: boolean;
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}