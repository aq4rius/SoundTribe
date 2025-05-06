import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="bg-base-100 shadow">
      <nav className="navbar container mx-auto">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case text-xl">SoundTribe</Link>
        </div>
        <div className="flex-none gap-2">
          <ThemeSwitcher />
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link to="/artists" className="btn btn-ghost btn-sm">Artists</Link>
              <Link to="/events" className="btn btn-ghost btn-sm">Events</Link>
              <button onClick={logout} className="btn btn-error btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;