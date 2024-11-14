import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditArtistProfile from './components/profile/EditArtistProfile';
import ProfileSetup from './components/profile/ProfileSetup';
import CreateArtistProfile from './components/profile/CreateArtistProfile';
import Layout from './components/layout/Layout';



interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfileSetup />} />} />
          <Route path="/create-artist-profile" element={<PrivateRoute element={<CreateArtistProfile />} />} />
          <Route path="/edit-artist-profile/:id" element={<PrivateRoute element={<EditArtistProfile />}/>} />
        </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;