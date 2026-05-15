import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listingsApi, matchesApi } from '../api/listings'
import { exchangesApi } from '../api/users'
import MatchCard, { normalizeMatch } from '../components/listings/MatchCard'
import {
  MapPin, Clock, User, Edit, Trash2, Sparkles,
  ArrowLeft, Package, CheckCircle, ExternalLink, X, ChevronDown
} from 'lucide-react'

const CATEGORY_LABELS = {
  ELECTRONICS: 'Électronique', CLOTHING: 'Vêtements', HOME_GARDEN: 'Maison & Jardin',
  SPORTS_OUTDOORS: 'Sport', BOOKS_MEDIA: 'Livres & Médias', TOOLS: 'Outillage',
  SERVICES: 'Services', SKILLS_EDUCATION: 'Compétences', OTHER: 'Autre',
}

const CONDITION_LABELS = {
  NEW: 'Neuf', LIKE_NEW: 'Comme neuf', EXCELLENT: 'Excellent état',
  GOOD: 'Bon état', FAIR: 'État correct', POOR: 'État passable',
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'badge-green' },
  DRAFT: { label: 'Brouillon', color: 'badge-stone' },
  EXCHANGED: { label: 'Échangée', color: 'badge-blue' },
  SUSPENDED: { label: 'Suspendue', color: 'badge-amber' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Aujourd\'hui'
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}

// Modal d'échange pour une annonce d'un autre utilisateur
function ExchangeModal({ listing, onClose, onSuccess }) {
  const [myListings, setMyListings] = useState([])
  const [selectedMyListing, setSelectedMyListing] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMyListings, setLoadingMyListings] = useState(true)

  useEffect(() => {
    listingsApi.getMine({ size: 50 })
      .then(res => {
        const items = (res.data?.content || []).filter(l => l.status !== 'EXCHANGED')
        setMyListings(items)
        if (items.length > 0) setSelectedMyListing(items[0])
      })
      .catch(() => {})
      .finally(() => setLoadingMyListings(false))
  }, [])

  const handleSend = async () => {
    setSending(true)
    try {
      const msg = message.trim() || (selectedMyListing
        ? `Bonjour, je souhaite échanger "${selectedMyListing.title}" contre votre annonce "${listing.title}".`
        : `Bonjour, votre annonce "${listing.title}" m'intéresse, souhaitez-vous échanger ?`)
      await exchangesApi.create({ listingId: listing.id, message: msg })
      onSuccess()
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la demande d'échange.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-stone-900">Proposer un échange</h3>
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">Pour : {listing.title}</p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélection de mon annonce */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Ce que je propose en échange
          </label>
          {loadingMyListings ? (
            <div className="h-10 bg-stone-100 animate-pulse rounded-lg" />
          ) : myListings.length === 0 ? (
            <div className="text-xs text-stone-500 bg-stone-50 rounded-lg p-3">
              Vous n'avez pas d'annonce active.{' '}
              <Link to="/listings/create" className="text-forest-700 underline" onClick={onClose}>
                Publier une annonce
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between gap-2 p-3 rounded-lg border border-stone-200 hover:border-stone-300 text-left text-sm"
              >
                <span className="line-clamp-1 text-stone-800">
                  {selectedMyListing?.title || 'Choisir une annonce...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                    {myListings.map(l => (
                      <button
                        key={l.id}
                        onClick={() => { setSelectedMyListing(l); setDropdownOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors ${selectedMyListing?.id === l.id ? 'bg-forest-50 text-forest-800' : 'text-stone-800'}`}
                      >
                        <p className="font-medium line-clamp-1">{l.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{l.locationText || ''}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Message <span className="font-normal text-stone-400">(optionnel)</span>
          </label>
          <textarea
            className="input w-full text-sm"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={selectedMyListing
              ? `Ex : Bonjour, je souhaite échanger "${selectedMyListing.title}" contre votre annonce...`
              : "Présentez-vous et expliquez votre proposition..."}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">Annuler</button>
          <button
            onClick={handleSend}
            disabled={sending || myListings.length === 0}
            className="btn-primary text-sm"
          >
            {sending ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchLoading, setMatchLoading] = useState(false)
  const [error, setError] = useState('')
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [exchangeSuccess, setExchangeSuccess] = useState(false)

  useEffect(() => {
    setLoading(true)
    setMatches([])
    setExchangeSuccess(false)
    listingsApi.getById(id)
      .then((res) => setListing(res.data))
      .catch(() => setError('Annonce introuvable.'))
      .finally(() => setLoading(false))
  }, [id])

  const isOwner = user && listing && (
    listing.ownerUsername === user.username ||
    listing.ownerId === user.id
  )

  // Charger les reco IA uniquement pour les PROPRES annonces
  useEffect(() => {
    if (!listing || !isOwner) return
    setMatchLoading(true)
    matchesApi.findForListing(id, { maxResults: 8 })
      .then((res) => setMatches((res.data?.matches || []).map(normalizeMatch)))
      .catch(() => setMatches([]))
      .finally(() => setMatchLoading(false))
  }, [listing, isOwner, id])

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette annonce ?')) return
    try {
      await listingsApi.remove(id)
      navigate('/listings/my')
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-stone-200 rounded w-1/3" />
            <div className="h-8 bg-stone-200 rounded w-2/3" />
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-4/5" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">{error || 'Annonce introuvable.'}</p>
          <Link to="/browse" className="btn-secondary text-sm">Retour aux annonces</Link>
        </div>
      </div>
    )
  }

  const statusConf = STATUS_CONFIG[listing.status] || { label: listing.status, color: 'badge-stone' }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux annonces
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Listing header */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={statusConf.color}>{statusConf.label}</span>
                    {listing.category && (
                      <span className="badge-stone">{CATEGORY_LABELS[listing.category] || listing.category}</span>
                    )}
                    {listing.condition && (
                      <span className="badge-green">{CONDITION_LABELS[listing.condition] || listing.condition}</span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-stone-900 leading-tight">{listing.title}</h1>
                </div>

                {isOwner && (
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/listings/${id}/edit`} className="btn-secondary text-xs px-2.5 py-1.5">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={handleDelete} className="btn-secondary text-xs px-2.5 py-1.5 text-red-600 hover:border-red-200 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-stone-600 leading-relaxed whitespace-pre-line">{listing.description}</p>

              <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-stone-100 text-sm text-stone-500">
                {listing.locationText && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />{listing.locationText}
                  </span>
                )}
                {listing.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />{timeAgo(listing.createdAt)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4" />{listing.viewsCount || 0} vues
                </span>
              </div>
            </div>

            {/* Recommandations IA — uniquement pour ses PROPRES annonces */}
            {isOwner && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-forest-600" />
                  <h2 className="section-title">Recommandations IA</h2>
                </div>

                {matchLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="card p-4 animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-stone-100 rounded-xl shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-stone-100 rounded w-3/4" />
                            <div className="h-3 bg-stone-100 rounded w-full" />
                            <div className="h-3 bg-stone-100 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : matches.length === 0 ? (
                  <div className="card p-6 text-center">
                    <Sparkles className="w-7 h-7 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-stone-500">Aucune recommandation pour l'instant.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.map((m, i) => (
                      <MatchCard
                        key={m.listingId || i}
                        match={m}
                        showExchange={true}
                        myListingTitle={listing.title}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-stone-400" />
                Publié par
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-800 font-semibold text-sm">
                  {listing.ownerName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{listing.ownerName || 'Utilisateur'}</p>
                </div>
              </div>

              {isAuthenticated && !isOwner && !exchangeSuccess && listing.status !== 'EXCHANGED' && (
                <button
                  onClick={() => setShowExchangeModal(true)}
                  className="btn-primary w-full justify-center py-2.5 text-sm"
                >
                  Proposer un échange
                </button>
              )}
              {exchangeSuccess && (
                <div className="text-sm text-forest-800 bg-forest-50 border border-forest-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Demande envoyée !{' '}
                  <Link to="/exchanges" className="underline">Voir mes échanges</Link>
                </div>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="btn-primary w-full justify-center py-2.5 text-sm text-center block">
                  Se connecter pour contacter
                </Link>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Détails</h3>
              <dl className="space-y-3">
                {listing.type && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-stone-500">Type</dt>
                    <dd className="text-xs font-medium text-stone-700">{listing.type}</dd>
                  </div>
                )}
                {listing.category && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-stone-500">Catégorie</dt>
                    <dd className="text-xs font-medium text-stone-700">{CATEGORY_LABELS[listing.category] || listing.category}</dd>
                  </div>
                )}
                {listing.condition && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-stone-500">État</dt>
                    <dd className="text-xs font-medium text-stone-700">{CONDITION_LABELS[listing.condition] || listing.condition}</dd>
                  </div>
                )}
                {listing.isDeliveryAvailable && (
                  <div className="flex justify-between">
                    <dt className="text-xs text-stone-500">Livraison</dt>
                    <dd className="flex items-center gap-1 text-xs text-forest-700">
                      <CheckCircle className="w-3 h-3" /> Disponible
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {showExchangeModal && (
        <ExchangeModal
          listing={listing}
          onClose={() => setShowExchangeModal(false)}
          onSuccess={() => {
            setShowExchangeModal(false)
            setExchangeSuccess(true)
          }}
        />
      )}
    </div>
  )
}
