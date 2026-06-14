import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const USER_TYPES = [
  { value: 'INDIVIDUAL', label: 'Particulier', desc: 'Personne physique, artisan' },
  { value: 'PROFESSIONAL', label: 'Professionnel', desc: 'Indépendant, freelance' },
  { value: 'BUSINESS', label: 'Entreprise', desc: 'TPE, PME, grande société' },
  { value: 'NON_PROFIT', label: 'Association', desc: 'Coopérative, ONG, institution' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    userType: 'INDIVIDUAL',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.firstName || !form.lastName) return 'Prénom et nom requis.'
    if (!form.username || form.username.length < 3) return 'Nom d\'utilisateur trop court (min. 3 caractères).'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email invalide.'
    if (!form.password || form.password.length < 8) return 'Mot de passe trop court (min. 8 caractères).'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/onboarding'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto px-4 text-center">
          <div className="card p-8">
            <div className="w-14 h-14 bg-forest-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-forest-700" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Compte créé</h2>
            <p className="text-sm text-stone-500">Redirection vers les informations de profil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8">
      <div className="w-full max-w-md mx-auto px-4">
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
            <h1 className="text-xl font-bold text-stone-900">Créer un compte</h1>
            <p className="text-sm text-stone-500 mt-1">Rejoignez la plateforme d'économie circulaire.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type de compte */}
            <div>
              <label className="label">Type de compte</label>
              <div className="grid grid-cols-2 gap-2">
                {USER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    aria-pressed={form.userType === type.value}
                    onClick={() => setForm((p) => ({ ...p, userType: type.value }))}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      form.userType === type.value
                        ? 'border-forest-700 bg-forest-50 text-forest-900'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <p className="font-medium text-xs">{type.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom et prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="firstName">Prénom</label>
                <input id="firstName" className="input" type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" autoComplete="given-name" />
              </div>
              <div>
                <label className="label" htmlFor="lastName">Nom</label>
                <input id="lastName" className="input" type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" autoComplete="family-name" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="username">Nom d'utilisateur</label>
              <input id="username" className="input" type="text" name="username" value={form.username} onChange={handleChange} placeholder="votre_identifiant" autoComplete="username" />
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" autoComplete="email" />
            </div>

            <div>
              <label className="label" htmlFor="phoneNumber">Téléphone (optionnel)</label>
              <input id="phoneNumber" className="input" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+212 6XX XXX XXX" autoComplete="tel" />
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
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
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
              {form.password && (
                <p className={`text-xs mt-1 ${form.password.length >= 8 ? 'text-forest-600' : 'text-stone-400'}`}>
                  {form.password.length >= 8 ? 'Longueur correcte' : `${8 - form.password.length} caractères manquants`}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-forest-700 font-medium hover:text-forest-900">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
