import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { listingsApi } from '../api/listings'
import { ArrowLeft, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
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

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category: '', type: 'ITEM', condition: 'GOOD',
    locationText: '', latitude: null, longitude: null,
    isPickupOnly: false, isDeliveryAvailable: false, deliveryRadiusKm: '',
  })

  useEffect(() => {
    listingsApi.getById(id)
      .then(res => {
        const l = res.data
        setForm({
          title: l.title || '',
          description: l.description || '',
          category: l.category || '',
          type: l.type || 'ITEM',
          condition: l.condition || 'GOOD',
          locationText: l.locationText || '',
          latitude: l.latitude || null,
          longitude: l.longitude || null,
          isPickupOnly: l.isPickupOnly || false,
          isDeliveryAvailable: l.isDeliveryAvailable || false,
          deliveryRadiusKm: l.deliveryRadiusKm ? String(l.deliveryRadiusKm) : '',
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const set = (key, value) => {
    setForm(p => ({ ...p, [key]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || form.title.length < 5) { setError('Titre trop court (min. 5 caractères).'); return }
    if (!form.description || form.description.length < 20) { setError('Description trop courte (min. 20 caractères).'); return }
    if (!form.category) { setError('Veuillez choisir une catégorie.'); return }

    setSaving(true)
    setError('')
    try {
      await listingsApi.update(id, {
        ...form,
        deliveryRadiusKm: form.deliveryRadiusKm ? parseInt(form.deliveryRadiusKm) : null,
      })
      navigate(`/listings/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    setDeleteError('')
    try {
      await listingsApi.remove(id)
      navigate('/listings/my')
    } catch {
      setShowDeleteConfirm(false)
      setDeleteError('Erreur lors de la suppression. Réessayez.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Annonce introuvable ou accès refusé.</p>
          <Link to="/listings/my" className="btn-secondary text-sm">Mes annonces</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/listings/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'annonce
          </Link>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Confirmer ?</span>
              <button onClick={handleDelete} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors">Oui</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }} className="text-xs px-2 py-1 rounded border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Non</button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Supprimer
            </button>
          )}
        </div>

        <h1 className="page-header mb-1">Modifier l'annonce</h1>
        <p className="text-stone-500 text-sm mb-8">Les modifications seront visibles immédiatement.</p>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="label">Type d'annonce</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TYPES.map(t => (
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

          {/* Title */}
          <div>
            <label className="label">Titre <span className="text-red-500">*</span></label>
            <input
              className="input"
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-stone-400 mt-1">{form.title.length}/200 caractères</p>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              className="input resize-none"
              rows={5}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              maxLength={5000}
            />
            <p className="text-xs text-stone-400 mt-1">{form.description.length}/5000 caractères</p>
          </div>

          {/* Category */}
          <div>
            <label className="label">Catégorie <span className="text-red-500">*</span></label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Choisir une catégorie</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          {form.type === 'ITEM' && (
            <div>
              <label className="label">État</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(c => (
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

          {/* Location */}
          {deleteError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {deleteError}
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

          {/* Delivery */}
          <div className="space-y-2">
            <label className="label">Options de remise</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPickupOnly}
                onChange={e => set('isPickupOnly', e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded border-stone-300 focus:ring-forest-600"
              />
              <span className="text-sm text-stone-700">Remise en main propre uniquement</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDeliveryAvailable}
                onChange={e => set('isDeliveryAvailable', e.target.checked)}
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
                  onChange={e => set('deliveryRadiusKm', e.target.value)}
                  placeholder="Rayon (km)"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link to={`/listings/${id}`} className="btn-secondary px-4 py-2.5">
              Annuler
            </Link>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
