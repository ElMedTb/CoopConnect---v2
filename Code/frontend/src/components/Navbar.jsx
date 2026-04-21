import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, LayoutDashboard, Package, Building2, ShieldCheck, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive(path) ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`;

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">CoopConnect</span>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent ml-1">AI</span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/resources" className={linkClass('/resources')}>
              <Package className="w-4 h-4" /> Annonces
            </Link>
            <Link to="/organizations" className={linkClass('/organizations')}>
              <Building2 className="w-4 h-4" /> Annuaire
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" /> Tableau de bord
              </Link>
            )}
            {isAuthenticated && user?.username === 'admin' && (
              <Link to="/admin" className={linkClass('/admin')}>
                <ShieldCheck className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-400 hidden sm:inline">{user?.firstName || user?.username}</span>
                <button onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm transition">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition">
                <LogIn className="w-4 h-4" /> Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
