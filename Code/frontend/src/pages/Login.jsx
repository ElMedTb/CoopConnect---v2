import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
            <Recycle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CoopConnect <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">AI</span></h1>
          <p className="text-slate-400 mt-2">Plateforme d'échanges circulaires</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Connexion</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  placeholder="Votre identifiant" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  placeholder="Votre mot de passe" required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <>Se connecter <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {/* Test accounts */}
          <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-slate-400 mb-1 font-medium">Comptes de test (mot de passe : Admin123!)</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['admin', 'coop_bio', 'restau_coll', 'menuiserie_pro'].map((u) => (
                <button key={u} onClick={() => { setUsername(u); setPassword('Admin123!'); }}
                  className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 transition">{u}</button>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
