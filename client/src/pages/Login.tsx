import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
    </div>
  );
};

export default Login;