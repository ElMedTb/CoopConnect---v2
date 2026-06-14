import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ShieldCheck, Smartphone, LocateFixed } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/users'
import { authApi } from '../api/auth'

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: user?.email || '',
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    phoneNumber: '',
    address: '',
    city: '',
    country: 'Maroc',
    latitude: '',
    longitude: '',
    organizationName: '',
    registrationNumber: '',
    ice: '',
    businessSector: '',
    credibilityNotes: '',
  })
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneSent, setPhoneSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setError('')
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalisation n est pas disponible dans ce navigateur.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        update('latitude', pos.coords.latitude.toFixed(6))
        update('longitude', pos.coords.longitude.toFixed(6))
      },
      () => setError('Impossible de recuperer la position actuelle.')
    )
  }

  const validate = () => {
    if (!form.firstName.trim()) return 'Le prenom est obligatoire.'
    if (!form.lastName.trim()) return 'Le nom est obligatoire.'
    if (!form.email.trim()) return 'L email est obligatoire.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'L email est invalide.'
    if (!form.phoneNumber.trim()) return 'Le numero de telephone est obligatoire.'
    if (!form.address.trim()) return 'L adresse est obligatoire.'
    if (!form.city.trim()) return 'La ville est obligatoire.'
    if (!form.country.trim()) return 'Le pays est obligatoire.'
    if (!form.latitude || !form.longitude) return 'La localisation sur la carte ou les coordonnees sont obligatoires.'
    return null
  }

  const sendPhoneCode = async () => {
    if (!form.phoneNumber.trim()) {
      setError('Ajoutez un numero de telephone avant de demander le code.')
      return
    }
    try {
      await authApi.sendPhoneCode({ username: user?.username, phoneNumber: form.phoneNumber.trim() })
      setPhoneSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d envoyer le code SMS.')
    }
  }

  const verifyPhone = async () => {
    if (!phoneCode.trim()) return
    try {
      await authApi.verifyPhoneCode({ username: user?.username, phoneNumber: form.phoneNumber.trim(), code: phoneCode.trim() })
      await usersApi.markPhoneVerified({ phoneNumber: form.phoneNumber.trim() })
      setPhoneVerified(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Code SMS invalide ou expire.')
    }
  }

  const sendEmailVerification = async () => {
    try {
      await authApi.sendEmailVerification({ usernameOrEmail: user?.username || form.email.trim() })
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d envoyer l email de verification.')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    setError('')
    try {
      await usersApi.completeOnboarding({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de finaliser le profil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-stone-900">Completer votre profil</h1>
          <p className="text-sm text-stone-500 mt-1">Ces informations ameliorent le matching et la confiance entre utilisateurs.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-semibold text-stone-900">Coordonnees et localisation</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input" required placeholder="Prenom *" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
              <input className="input" required placeholder="Nom *" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
              <div className="flex gap-2">
                <input className="input flex-1" required type="email" placeholder="Email *" value={form.email} onChange={e => update('email', e.target.value)} />
                <button type="button" onClick={sendEmailVerification} className="btn-secondary text-sm whitespace-nowrap">
                  Verifier
                </button>
              </div>
              <input className="input" required type="tel" placeholder="+212 6XX XXX XXX *" value={form.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} />
              <input className="input sm:col-span-2" required placeholder="Adresse *" value={form.address} onChange={e => update('address', e.target.value)} />
              <input className="input" required placeholder="Ville *" value={form.city} onChange={e => update('city', e.target.value)} />
              <input className="input" required placeholder="Pays *" value={form.country} onChange={e => update('country', e.target.value)} />
              <input className="input" required placeholder="Latitude *" value={form.latitude} onChange={e => update('latitude', e.target.value)} />
              <div className="flex gap-2">
                <input className="input flex-1" required placeholder="Longitude *" value={form.longitude} onChange={e => update('longitude', e.target.value)} />
                <button type="button" onClick={useCurrentLocation} className="btn-secondary px-3" aria-label="Utiliser ma position">
                  <LocateFixed className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-semibold text-stone-900">Verification telephone</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={sendPhoneCode} className="btn-secondary text-sm">
                Envoyer le code SMS
              </button>
              {phoneSent && (
                <>
                  <input className="input w-36" placeholder="Code SMS" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} />
                  <button type="button" onClick={verifyPhone} className="btn-primary text-sm">
                    Verifier
                  </button>
                </>
              )}
              {phoneVerified && <span className="badge-green self-center">Telephone verifie</span>}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-semibold text-stone-900">Credibilite association ou entreprise</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input" placeholder="Nom organisation" value={form.organizationName} onChange={e => update('organizationName', e.target.value)} />
              <input className="input" placeholder="Secteur" value={form.businessSector} onChange={e => update('businessSector', e.target.value)} />
              <input className="input" placeholder="RC ou numero d enregistrement" value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} />
              <input className="input" placeholder="ICE" value={form.ice} onChange={e => update('ice', e.target.value)} />
              <textarea className="input sm:col-span-2" rows={3} placeholder="Informations de confiance utiles" value={form.credibilityNotes} onChange={e => update('credibilityNotes', e.target.value)} />
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
              Plus tard
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Enregistrement...' : 'Terminer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
