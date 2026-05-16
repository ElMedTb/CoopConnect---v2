import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listingsApi } from '../api/listings'
import ListingCard from '../components/listings/ListingCard'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'ELECTRONICS', label: 'Électronique' },
  { value: 'CLOTHING', label: 'Vêtements' },
  { value: 'HOME_GARDEN', label: 'Maison & Jardin' },
  { value: 'TOOLS', label: 'Outillage' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'SKILLS_EDUCATION', label: 'Compétences' },
  { value: 'SPORTS_OUTDOORS', label: 'Sport' },
  { value: 'BOOKS_MEDIA', label: 'Livres & Médias' },
  { value: 'OTHER', label: 'Autre' },
]

const TYPES = [
  { value: '', label: 'Tout type' },
  { value: 'ITEM', label: 'Objet' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'SKILL', label: 'Compétence' },
  { value: 'SPACE', label: 'Espace' },
  { value: 'TRANSPORT', label: 'Transport' },
]

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const type = searchParams.get('type') || ''
  const page = parseInt(searchParams.get('page') || '0')

  const [searchInput, setSearchInput] = useState(query)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchListings = useCallback(() => {
    setLoading(true)
    setFetchError('')
    const params = { page, size: 12 }
    if (category) params.category = category
    if (type) params.type = type

    const promise = query
      ? listingsApi.search(query, params)
      : listingsApi.getAll(params)

    promise
      .then((res) => {
        const data = res.data
        const available = (data?.content || []).filter(l => l.status !== 'EXCHANGED')
        setListings(available)
        setTotalPages(data?.totalPages || 0)
        setTotalElements(data?.totalElements || 0)
      })
      .catch(() => {
        setListings([])
        setFetchError('Impossible de charger les annonces. Vérifiez votre connexion et réessayez.')
      })
      .finally(() => setLoading(false))
  }, [query, category, type, page])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('q', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilters = query || category || type

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-header mb-1">Annonces</h1>
          <p className="text-stone-500 text-sm">
            {loading ? 'Chargement...' : `${totalElements.toLocaleString()} annonce${totalElements !== 1 ? 's' : ''} disponible${totalElements !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                className="input pl-9 w-full"
                type="text"
                placeholder="Rechercher des annonces..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-4">Rechercher</button>
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn-secondary px-3 ${filtersOpen ? 'bg-stone-100' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filtres</span>
            </button>
          </div>
        </form>

        {/* Filters */}
        {filtersOpen && (
          <div className="card p-4 mb-5">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="label">Catégorie</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => updateParam('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="label">Type</label>
                <select
                  className="input"
                  value={type}
                  onChange={(e) => updateParam('type', e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {query && (
              <span className="flex items-center gap-1.5 text-xs bg-white border border-stone-200 rounded-full px-3 py-1">
                Recherche : <strong>{query}</strong>
                <button onClick={() => { setSearchInput(''); updateParam('q', '') }} className="text-stone-400 hover:text-stone-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5 text-xs bg-white border border-stone-200 rounded-full px-3 py-1">
                {CATEGORIES.find(c => c.value === category)?.label}
                <button onClick={() => updateParam('category', '')} className="text-stone-400 hover:text-stone-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-stone-500 hover:text-stone-700 underline">
              Effacer tout
            </button>
          </div>
        )}

        {/* Category quick-filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.slice(1).map((c) => (
            <button
              key={c.value}
              onClick={() => updateParam('category', category === c.value ? '' : c.value)}
              aria-pressed={category === c.value}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                category === c.value
                  ? 'bg-forest-800 text-white border-forest-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Fetch error */}
        {fetchError && !loading && (
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
            <span>{fetchError}</span>
            <button onClick={fetchListings} className="shrink-0 text-xs font-medium underline hover:no-underline">
              Réessayer
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-stone-100 rounded w-full mb-1" />
                <div className="h-3 bg-stone-100 rounded w-5/6 mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-stone-100 rounded-md" />
                  <div className="h-5 w-12 bg-stone-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium mb-1">Aucune annonce trouvée</p>
            <p className="text-stone-400 text-sm">Essayez d'autres termes ou supprimez les filtres.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => updateParam('page', String(page - 1))}
              disabled={page === 0}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-stone-600">
              Page {page + 1} sur {totalPages}
            </span>
            <button
              onClick={() => updateParam('page', String(page + 1))}
              disabled={page >= totalPages - 1}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
