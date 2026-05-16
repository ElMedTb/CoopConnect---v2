import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listingsApi } from '../api/listings'
import ListingCard from '../components/listings/ListingCard'
import { Plus, Package } from 'lucide-react'

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listingsApi.getMine({ size: 50 })
      .then((res) => {
        const all = res.data?.content || []
        setListings(all.filter(l => l.status !== 'EXCHANGED'))
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-header mb-1">Mes annonces</h1>
            <p className="text-stone-500 text-sm">
              {loading ? '...' : `${listings.length} annonce${listings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link to="/listings/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nouvelle annonce
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-stone-100 rounded w-full mb-1" />
                <div className="h-3 bg-stone-100 rounded w-5/6 mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-stone-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 font-medium mb-2">Aucune annonce publiée</p>
            <p className="text-stone-500 text-sm mb-6">
              Publiez votre première annonce pour que les correspondances soient détectées automatiquement.
            </p>
            <Link to="/listings/create" className="btn-primary">
              <Plus className="w-4 h-4" />
              Créer ma première annonce
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
