import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listingsApi } from '../api/listings'
import { Package, Plus, ArrowLeftRight, Sparkles, AlertTriangle } from 'lucide-react'
import ListingCard from '../components/listings/ListingCard'
import { exchangesApi } from '../api/users'

function StatCard({ icon: Icon, value, label, sub, color = 'bg-stone-100 text-stone-600' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-forest-600 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [myListings, setMyListings] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    listingsApi.getMine({ size: 50 })
      .then((res) => setMyListings(res.data?.content || []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))

    exchangesApi.getMy()
      .then(res => setExchanges(res.data || []))
      .catch(() => {})
  }, [])

  const firstName = user?.fullName?.split(' ')[0] || 'là'
  const pendingExchanges = exchanges.filter(e => e.status === 'REQUESTED').length
  const activeExchanges = exchanges.filter(e => ['REQUESTED','ACCEPTED','IN_PROGRESS'].includes(e.status)).length
  const isFirstRun = !loading && !loadError && myListings.length === 0 && exchanges.length === 0

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="page-header">Bonjour, {firstName}</h1>
            <p className="text-stone-500 text-sm mt-1">Voici un aperçu de votre activité.</p>
          </div>
          <Link to="/listings/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nouvelle annonce
          </Link>
        </div>

        {/* First-run: no listings, no exchanges yet */}
        {isFirstRun ? (
          <div className="max-w-md mx-auto text-center py-6">
            <div className="w-14 h-14 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-forest-100">
              <Sparkles className="w-7 h-7 text-forest-700" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Publiez votre première annonce</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Décrivez ce que vous proposez ou ce dont vous avez besoin.
              L'IA détectera automatiquement les meilleures correspondances dans votre région.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/listings/create" className="btn-primary px-5 py-2.5">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Publier une annonce
              </Link>
              <Link to="/browse" className="btn-secondary px-5 py-2.5">
                Explorer les annonces
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Package}
                value={loading ? '—' : myListings.length}
                label="Mes annonces"
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={ArrowLeftRight}
                value={activeExchanges}
                label="Échanges actifs"
                sub={pendingExchanges > 0 ? `${pendingExchanges} en attente` : undefined}
                color="bg-amber-50 text-amber-700"
              />
              <Link to="/matches" className="card p-5 hover:shadow-card-hover transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-forest-50 text-forest-700">
                    <Sparkles className="w-4.5 h-4.5" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-stone-900 mt-1">Recommandations</p>
                <p className="text-xs text-stone-500 mt-0.5">Correspondances détectées</p>
                <p className="text-xs text-forest-600 mt-2 group-hover:underline">Voir pour mes annonces →</p>
              </Link>
              <Link to="/exchanges" className="card p-5 hover:shadow-card-hover transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-stone-100 text-stone-600">
                    <ArrowLeftRight className="w-4.5 h-4.5" aria-hidden="true" />
                  </div>
                  {pendingExchanges > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                      {pendingExchanges}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-stone-900">{exchanges.length}</p>
                <p className="text-sm text-stone-500 mt-0.5">Mes échanges</p>
              </Link>
            </div>

            {/* Mes annonces */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Mes annonces ({myListings.length})</h2>
                <Link to="/listings/my" className="text-sm text-forest-700 hover:text-forest-900 font-medium">
                  Gérer mes annonces →
                </Link>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-stone-100 rounded w-full mb-1" />
                      <div className="h-3 bg-stone-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div className="card p-6 flex items-center gap-3 text-sm text-stone-600">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
                  Impossible de charger vos annonces.{' '}
                  <button
                    onClick={() => { setLoadError(false); setLoading(true); listingsApi.getMine({ size: 50 }).then(res => setMyListings(res.data?.content || [])).catch(() => setLoadError(true)).finally(() => setLoading(false)) }}
                    className="underline hover:no-underline"
                  >
                    Réessayer
                  </button>
                </div>
              ) : myListings.length === 0 ? (
                <div className="card p-10 text-center">
                  <Package className="w-10 h-10 text-stone-300 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-stone-600 font-medium mb-2">Aucune annonce publiée</p>
                  <p className="text-stone-500 text-sm mb-6">
                    Publiez votre première annonce et laissez l'IA trouver des correspondances.
                  </p>
                  <Link to="/listings/create" className="btn-primary">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Créer ma première annonce
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {myListings.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
