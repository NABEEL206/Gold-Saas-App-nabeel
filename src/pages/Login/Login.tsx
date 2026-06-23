import React from 'react';
import { LoginForm } from '../../components/Login/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

export default Login;