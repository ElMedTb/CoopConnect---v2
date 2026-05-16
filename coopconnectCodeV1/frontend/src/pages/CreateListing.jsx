import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { listingsApi } from '../api/listings'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import LocationPicker from '../components/listings/LocationPicker'

const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Électronique' },
  { value: 'CLOTHING', label: 'Vêtements' },
  { value: 'HOME_GARDEN', label: 'Maison & Jardin' },
  { value: 'SPORTS_OUTDOORS', label: 'Sport & Outdoor' },
  { value: 'BOOKS_MEDIA', label: 'Livres & Médias' },
  { value: 'TOYS_GAMES', label: 'Jouets & Jeux' },
  { value: 'HEALTH_BEAUTY', label: 'Santé & Beauté' },
  { value: 'AUTOMOTIVE', label: 'Automobile' },
  { value: 'TOOLS', label: 'Outillage' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'SKILLS_EDUCATION', label: 'Compétences & Formation' },
  { value: 'TRANSPORTATION', label: 'Transport' },
  { value: 'OTHER', label: 'Autre' },
]

const TYPES = [
  { value: 'ITEM', label: 'Objet physique', desc: 'Produit, matière première, équipement' },
  { value: 'SERVICE', label: 'Service', desc: 'Prestation, aide ponctuelle' },
  { value: 'SKILL', label: 'Compétence', desc: 'Expertise, savoir-faire, formation' },
  { value: 'SPACE', label: 'Espace', desc: 'Local, entrepôt, terrain' },
  { value: 'TRANSPORT', label: 'Transport', desc: 'Véhicule, capacité logistique' },
]

const CONDITIONS = [
  { value: 'NEW', label: 'Neuf' },
  { value: 'LIKE_NEW', label: 'Comme neuf' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Bon état' },
  { value: 'FAIR', label: 'Correct' },
  { value: 'POOR', label: 'Passable' },
]

export default function CreateListing() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    type: 'ITEM',
    condition: 'GOOD',
    locationText: '',
    latitude: null,
    longitude: null,
    isPickupOnly: false,
    isDeliveryAvailable: false,
    deliveryRadiusKm: '',
  })

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!form.title || form.title.length < 5) return 'Titre trop court (min. 5 caractères).'
    if (!form.description || form.description.length < 20) return 'Description trop courte (min. 20 caractères).'
    if (!form.category) return 'Veuillez choisir une catégorie.'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        deliveryRadiusKm: form.deliveryRadiusKm ? parseInt(form.deliveryRadiusKm) : null,
      }
      const res = await listingsApi.create(payload)
      navigate(`/listings/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'annonce.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="page-header mb-1">Publier une annonce</h1>
          <p className="text-stone-500 text-sm">Les meilleures correspondances seront détectées automatiquement dans votre région.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  s < step ? 'bg-forest-700 text-white' :
                  s === step ? 'bg-forest-800 text-white' :
                  'bg-stone-200 text-stone-500'
                }`}>
                  {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm ${s === step ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
                  {s === 1 ? 'Informations' : 'Détails'}
                </span>
              </div>
              {s < 2 && <div className="flex-1 h-px bg-stone-200" />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="card p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Type d'annonce</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('type', t.value)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        form.type === t.value
                          ? 'border-forest-700 bg-forest-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-stone-900">{t.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Titre <span className="text-red-500">*</span></label>
                <input
                  className="input"
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Ex : Lot de 200kg de légumes bio — livraison possible"
                  maxLength={200}
                />
                <p className="text-xs text-stone-400 mt-1">{form.title.length}/200 caractères</p>
              </div>

              <div>
                <label className="label">Description <span className="text-red-500">*</span></label>
                <textarea
                  className="input resize-none"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Décrivez précisément ce que vous proposez ou recherchez, l'état, les conditions d'échange..."
                  maxLength={5000}
                />
                <p className="text-xs text-stone-400 mt-1">{form.description.length}/5000 caractères</p>
              </div>

              <div>
                <label className="label">Catégorie <span className="text-red-500">*</span></label>
                <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Choisir une catégorie</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={handleNext} className="btn-primary px-6 py-2.5">
                  Continuer
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {form.type === 'ITEM' && (
                <div>
                  <label className="label">État</label>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set('condition', c.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          form.condition === c.value
                            ? 'border-forest-700 bg-forest-50 text-forest-800 font-medium'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                locationText={form.locationText}
                onChange={({ latitude, longitude, locationText }) => {
                  setForm(p => ({ ...p, latitude, longitude, locationText }))
                  setError('')
                }}
              />

              <div className="space-y-2">
                <label className="label">Options de remise</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPickupOnly}
                    onChange={(e) => set('isPickupOnly', e.target.checked)}
                    className="w-4 h-4 text-forest-700 rounded border-stone-300 focus:ring-forest-600"
                  />
                  <span className="text-sm text-stone-700">Remise en main propre uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDeliveryAvailable}
                    onChange={(e) => set('isDeliveryAvailable', e.target.checked)}
                    className="w-4 h-4 text-forest-700 rounded border-stone-300 focus:ring-forest-600"
                  />
                  <span className="text-sm text-stone-700">Livraison disponible</span>
                </label>
                {form.isDeliveryAvailable && (
                  <div className="ml-6">
                    <input
                      className="input w-32"
                      type="number"
                      min="1"
                      value={form.deliveryRadiusKm}
                      onChange={(e) => set('deliveryRadiusKm', e.target.value)}
                      placeholder="Rayon (km)"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary px-4 py-2.5"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center py-2.5"
                >
                  {loading ? 'Publication...' : 'Publier l\'annonce'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
