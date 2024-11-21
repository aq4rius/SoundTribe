import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="bg-blue-200 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">SoundTribe</Link>
        <div>
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard" className="mr-4">Dashboard</Link>
              <Link to="/artists" className="mr-4">Artists</Link>
              <Link to="/events" className="mr-4">Events</Link>
              <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;