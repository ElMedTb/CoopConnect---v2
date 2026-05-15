import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/users'
import { listingsApi } from '../api/listings'
import ListingCard from '../components/listings/ListingCard'
import { User, MapPin, Phone, FileText, Lock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()

  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info') // 'info' | 'password'

  const [form, setForm] = useState({
    firstName: '', lastName: '', bio: '', city: '', country: '', phoneNumber: '',
  })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      usersApi.getMe(),
      listingsApi.getMine(),
    ]).then(([profileRes, listingsRes]) => {
      const p = profileRes.data
      setProfile(p)
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        bio: p.bio || '',
        city: p.city || '',
        country: p.country || '',
        phoneNumber: p.phoneNumber || '',
      })
      const items = listingsRes.data?.content || listingsRes.data || []
      setListings(Array.isArray(items) ? items : [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleInfoSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      const res = await usersApi.updateMe(form)
      setProfile(res.data)
      setSuccess('Profil mis à jour.')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (pwdForm.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setSaving(true)
    try {
      await usersApi.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      })
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' })
      setSuccess('Mot de passe modifié avec succès.')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-forest-800 font-bold text-xl shrink-0">
              {profile?.firstName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-sm text-stone-500">@{profile?.username}</p>
              {profile?.city && (
                <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {profile.city}{profile.country ? `, ${profile.country}` : ''}
                </p>
              )}
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <span className="badge-stone text-xs">{profile?.userType}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — edit form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => { setTab('info'); setSuccess(''); setError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'info' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Informations
              </button>
              <button
                onClick={() => { setTab('password'); setSuccess(''); setError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'password' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Mot de passe
              </button>
            </div>

            {success && (
              <div className="flex items-center gap-2 text-sm text-forest-800 bg-forest-50 border border-forest-200 rounded-lg px-4 py-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {tab === 'info' && (
              <form onSubmit={handleInfoSave} className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Prénom</label>
                    <input
                      className="input w-full"
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Nom</label>
                    <input
                      className="input w-full"
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="Nom"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Bio</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Quelques mots sur vous..."
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Ville</label>
                    <input
                      className="input w-full"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Casablanca"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Pays</label>
                    <input
                      className="input w-full"
                      value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      placeholder="Maroc"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Téléphone</label>
                  <input
                    className="input w-full"
                    value={form.phoneNumber}
                    onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={handlePasswordSave} className="card p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    className="input w-full"
                    value={pwdForm.currentPassword}
                    onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="input w-full"
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="input w-full"
                    value={pwdForm.confirm}
                    onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Modification...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">Compte</h3>
              <dl className="space-y-2.5">
                <div className="flex justify-between">
                  <dt className="text-xs text-stone-500">Email</dt>
                  <dd className="text-xs font-medium text-stone-700 truncate max-w-[140px]">{profile?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-stone-500">Vérifié</dt>
                  <dd className="text-xs">{profile?.emailVerified ? <span className="text-forest-700">Oui</span> : <span className="text-amber-600">Non</span>}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs text-stone-500">Annonces</dt>
                  <dd className="text-xs font-medium text-stone-700">{listings.length}</dd>
                </div>
              </dl>
            </div>

            <Link to="/exchanges" className="card p-5 flex items-center justify-between hover:shadow-card-hover transition-shadow group">
              <div>
                <p className="text-sm font-semibold text-stone-900">Mes échanges</p>
                <p className="text-xs text-stone-500 mt-0.5">Demandes envoyées et reçues</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-forest-700 transition-colors" />
            </Link>
          </div>
        </div>

        {/* My listings */}
        {listings.length > 0 && (
          <div className="mt-8">
            <h2 className="section-title mb-4">Mes annonces ({listings.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
