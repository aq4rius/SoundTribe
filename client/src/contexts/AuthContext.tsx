import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, getCurrentUser } from '../services/auth';
// import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  artistProfileCompleted: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setIsAuthenticated(true);
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (emailOrToken: string, passwordOrUser: string | User) => {
    let data;
    if (typeof passwordOrUser === 'string') {
      // This is a regular login with email and password
      data = await login(emailOrToken, passwordOrUser);
    } else {
      // This is updating the user after profile completion
      data = { token: emailOrToken, user: passwordOrUser };
    }
    localStorage.setItem('token', data.token);
    setIsAuthenticated(true);
    setUser(data.user);
  };

  const registerUser = async (userData: any) => {
    const data = await register(userData);
    localStorage.setItem('token', data.token);
    setIsAuthenticated(true);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    // navigate('/'); // Navigate to home page after logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login: loginUser, register: registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};