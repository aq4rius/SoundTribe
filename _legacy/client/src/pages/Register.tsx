// client/src/pages/Register.tsx

import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const Register: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 w-1/2 mx-auto">Register</h1>
      <RegisterForm />
    </div>
  );
};

export default Register;
