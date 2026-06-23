import React from 'react';
import { RegisterSidebar } from '../../components/Registration/RegisterSidebar';
import { RegisterForm } from '../../components/Registration/RegisterForm';


const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RegisterSidebar/>
      <RegisterForm/>
    </div>
  );
};

export default Register;