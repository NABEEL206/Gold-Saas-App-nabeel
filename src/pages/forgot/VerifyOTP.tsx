import React from 'react';
import { VerifyOTPForm } from '../../components/forgot/VerifyOTPForm';

const VerifyOTP: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <VerifyOTPForm />
    </div>
  );
};

export default VerifyOTP;