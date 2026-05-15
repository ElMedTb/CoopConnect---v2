import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listingsApi } from '../api/listings'
import { Package, Plus, ArrowLeftRight, Sparkles } from 'lucide-react'
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

  useEffect(() => {
    listingsApi.getMine({ size: 50 })
      .then((res) => setMyListings(res.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    exchangesApi.getMy()
      .then(res => setExchanges(res.data || []))
      .catch(() => {})
  }, [])

  const firstName = user?.fullName?.split(' ')[0] || 'là'
  const pendingExchanges = exchanges.filter(e => e.status === 'REQUESTED').length
  const activeExchanges = exchanges.filter(e => ['REQUESTED','ACCEPTED','IN_PROGRESS'].includes(e.status)).length

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

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
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900">IA</p>
            <p className="text-sm text-stone-500 mt-0.5">Recommandations</p>
            <p className="text-xs text-forest-600 mt-1 group-hover:underline">Voir pour mes annonces →</p>
          </Link>
          <Link to="/exchanges" className="card p-5 hover:shadow-card-hover transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-stone-100 text-stone-600">
                <ArrowLeftRight className="w-4.5 h-4.5" />
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
          ) : myListings.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-600 font-medium mb-2">Aucune annonce publiée</p>
              <p className="text-stone-400 text-sm mb-6">
                Publiez votre première annonce et laissez l'IA trouver des correspondances.
              </p>
              <Link to="/listings/create" className="btn-primary">
                <Plus className="w-4 h-4" />
                Créer ma première annonce
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
