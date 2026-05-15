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
    matchesApi.findForListing(selectedListing.id, { maxResults: 10 })
      .then(res => setMatches((res.data?.matches || []).map(normalizeMatch)))
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false))
  }, [selectedListing])

  const selectListing = (listing) => {
    setSelectedListing(listing)
    setDropdownOpen(false)
  }

  if (loadingListings) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (myListings.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-stone-900 mb-2">Aucune annonce publiée</h1>
          <p className="text-stone-500 text-sm mb-6">
            Publiez une annonce pour que l'IA détecte automatiquement les meilleures correspondances.
          </p>
          <Link to="/listings/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            Publier ma première annonce
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="page-header flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-forest-600" />
            Recommandations IA
          </h1>
          <p className="text-stone-500 text-sm">
            Sélectionnez une de vos annonces pour voir les meilleures correspondances détectées par l'IA.
          </p>
        </div>

        {/* Sélecteur d'annonce */}
        <div className="card p-4 mb-6">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Mon annonce
          </p>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors text-left"
            >
              {selectedListing ? (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 line-clamp-1">{selectedListing.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {CATEGORY_LABELS[selectedListing.category] || selectedListing.category}
                    {selectedListing.locationText && ` · ${selectedListing.locationText}`}
                  </p>
                </div>
              ) : (
                <span className="text-sm text-stone-400">Choisir une annonce...</span>
              )}
              <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-dropdown z-20 max-h-60 overflow-y-auto">
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
        </div>

        {/* Correspondances */}
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
        ) : matches.length === 0 ? (
          <div className="card p-10 text-center">
            <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium mb-1">Aucune correspondance détectée</p>
            <p className="text-stone-400 text-sm">
              D'autres annonces seront analysées au fur et à mesure qu'elles seront publiées.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-600 font-medium">
                {matches.length} correspondance{matches.length > 1 ? 's' : ''} détectée{matches.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => {
                  if (!selectedListing) return
                  setLoadingMatches(true)
                  matchesApi.findForListing(selectedListing.id, { maxResults: 10 })
                    .then(res => setMatches((res.data?.matches || []).map(normalizeMatch)))
                    .catch(() => {})
                    .finally(() => setLoadingMatches(false))
                }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-800">
              <strong>Comment ça marche :</strong> Cliquez sur "Proposer un échange" pour envoyer automatiquement
              une demande au propriétaire de l'annonce. Il recevra votre proposition et pourra l'accepter ou la refuser.
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
  )
}
