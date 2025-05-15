// client/src/pages/Login.tsx

import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 w-1/2 mx-auto">Sign in</h1>
      <LoginForm />
    </div>
  );
};

export default Login;
