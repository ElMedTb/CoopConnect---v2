import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center">
      <div className="w-full max-w-sm mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-forest-800 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 text-lg">CoopConnect</span>
          </Link>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-stone-900">Connexion</h1>
            <p className="text-sm text-stone-500 mt-1">Bon retour sur la plateforme.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                className="input"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="votre_identifiant"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  className="input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-forest-700 font-medium hover:text-forest-900">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
