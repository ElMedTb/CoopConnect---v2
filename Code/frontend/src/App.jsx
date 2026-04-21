import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Organizations from './pages/Organizations';
import AdminPanel from './pages/AdminPanel';
import CreateResource from './pages/CreateResource';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const Layout = ({ children, showNav = true }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    {showNav && <Navbar />}
    {children}
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/resources" element={<Layout><Resources /></Layout>} />
      <Route path="/organizations" element={<Layout><Organizations /></Layout>} />
      <Route path="/admin" element={<PrivateRoute><Layout><AdminPanel /></Layout></PrivateRoute>} />
      <Route path="/create-resource" element={<PrivateRoute><Layout><CreateResource /></Layout></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/resources" />} />
      <Route path="*" element={<Navigate to="/resources" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
