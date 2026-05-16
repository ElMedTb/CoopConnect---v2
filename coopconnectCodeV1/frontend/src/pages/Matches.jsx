import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { matchesApi, listingsApi } from '../api/listings'
import MatchCard, { normalizeMatch } from '../components/listings/MatchCard'
import { Sparkles, RefreshCw, Package, Plus, ChevronDown } from 'lucide-react'

const CATEGORY_LABELS = {
  ELECTRONICS: 'Électronique', CLOTHING: 'Vêtements', HOME_GARDEN: 'Maison & Jardin',
  TOOLS: 'Outillage', SERVICES: 'Services', SKILLS_EDUCATION: 'Compétences',
  SPORTS_OUTDOORS: 'Sport', BOOKS_MEDIA: 'Livres', OTHER: 'Autre',
}

export default function Matches() {
  const [myListings, setMyListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [matches, setMatches] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [matchError, setMatchError] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Charger les annonces de l'utilisateur
  useEffect(() => {
    listingsApi.getMine({ size: 50 })
      .then(res => {
        const items = res.data?.content || []
        setMyListings(items)
        if (items.length > 0) {
          setSelectedListing(items[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingListings(false))
  }, [])

  // Charger les matches quand une annonce est sélectionnée
  useEffect(() => {
    if (!selectedListing) return
    setLoadingMatches(true)
    setMatches([])
    setMatchError(false)
    matchesApi.findForListing(selectedListing.id, { maxResults: 10 })
      .then(res => setMatches((res.data?.matches || []).map(normalizeMatch)))
      .catch(() => { setMatches([]); setMatchError(true) })
      .finally(() => setLoadingMatches(false))
  }, [selectedListing])

  const selectListing = (listing) => {
    setSelectedListing(listing)
    setDropdownOpen(false)
  }

  if (loadingListings) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (myListings.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-forest-100">
            <Sparkles className="w-7 h-7 text-forest-700" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">Publiez une annonce pour activer l'IA</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
            L'IA analyse votre annonce et détecte automatiquement les meilleures correspondances par contenu, catégorie et proximité géographique.
          </p>
          <Link to="/listings/create" className="btn-primary">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Publier ma première annonce
          </Link>
        </div>
      </div>
    )
  }

  const refreshMatches = () => {
    if (!selectedListing) return
    setLoadingMatches(true)
    matchesApi.findForListing(selectedListing.id, { maxResults: 10 })
      .then(res => setMatches((res.data?.matches || []).map(normalizeMatch)))
      .catch(() => {})
      .finally(() => setLoadingMatches(false))
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-forest-600" aria-hidden="true" />
          <h1 className="page-header">Recommandations</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Left panel: listing selector */}
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                Mon annonce
              </p>

              {selectedListing && (
                <div className="mb-4 pb-4 border-b border-stone-100">
                  <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
                    {selectedListing.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {CATEGORY_LABELS[selectedListing.category] || selectedListing.category}
                    {selectedListing.locationText && ` · ${selectedListing.locationText}`}
                  </p>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg border border-stone-200 hover:border-stone-300 text-left transition-colors"
                >
                  <span className="text-stone-500">Changer l'annonce</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-dropdown z-20 max-h-64 overflow-y-auto">
                      {myListings.map(l => (
                        <button
                          key={l.id}
                          onClick={() => selectListing(l)}
                          className={`w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors ${selectedListing?.id === l.id ? 'bg-forest-50' : ''}`}
                        >
                          <p className="text-sm font-medium text-stone-900 line-clamp-1">{l.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {CATEGORY_LABELS[l.category] || l.category}
                            {l.locationText && ` · ${l.locationText}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {selectedListing && (
                <Link
                  to={`/listings/${selectedListing.id}/edit`}
                  className="mt-3 text-xs text-forest-700 hover:text-forest-900 font-medium block transition-colors"
                >
                  Modifier cette annonce →
                </Link>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-3 text-xs text-amber-800 leading-relaxed">
              Cliquez sur "Proposer un échange" pour envoyer une demande directement au propriétaire de l'annonce correspondante.
            </div>
          </div>

          {/* Right panel: results */}
          <div className="lg:col-span-2">
            {loadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-stone-100 rounded w-3/4" />
                        <div className="h-3 bg-stone-100 rounded w-full" />
                        <div className="h-3 bg-stone-100 rounded w-1/2" />
                        {[1,2,3,4].map(j => <div key={j} className="h-2 bg-stone-100 rounded" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : matchError ? (
              <div className="card p-8 text-center">
                <p className="text-stone-600 font-medium mb-1">Erreur lors du chargement</p>
                <p className="text-stone-500 text-sm mb-4">Vérifiez votre connexion et réessayez.</p>
                <button
                  onClick={() => {
                    setMatchError(false)
                    setLoadingMatches(true)
                    matchesApi.findForListing(selectedListing.id, { maxResults: 10 })
                      .then(res => setMatches((res.data?.matches || []).map(normalizeMatch)))
                      .catch(() => { setMatches([]); setMatchError(true) })
                      .finally(() => setLoadingMatches(false))
                  }}
                  className="btn-secondary text-sm"
                >
                  Réessayer
                </button>
              </div>
            ) : matches.length === 0 ? (
              <div className="card p-8 text-center">
                <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-stone-700 font-medium mb-2">Aucune correspondance pour l'instant</p>
                <p className="text-stone-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                  Le moteur analyse les nouvelles annonces en continu. Une description détaillée améliore la qualité des correspondances.
                </p>
                <Link to="/browse" className="btn-secondary text-sm">
                  Parcourir les annonces
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-stone-600 font-medium">
                    {matches.length} correspondance{matches.length > 1 ? 's' : ''} détectée{matches.length > 1 ? 's' : ''}
                  </p>
                  <button onClick={refreshMatches} className="btn-secondary text-xs px-3 py-1.5">
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    Actualiser
                  </button>
                </div>
                <div className="space-y-4">
                  {matches.map((m, i) => (
                    <MatchCard
                      key={m.listingId || i}
                      match={m}
                      showExchange={true}
                      myListingTitle={selectedListing?.title}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
