import React from 'react';
import { ResetPasswordForm } from '../../components/forgot/ResetPasswordForm';

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPassword;