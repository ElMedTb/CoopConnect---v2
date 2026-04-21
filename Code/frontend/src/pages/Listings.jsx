import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, MapPin, Package, Tag, ArrowLeft } from 'lucide-react';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchListings();
  }, [page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const url = search
        ? `/api/v1/listings/search?keyword=${encodeURIComponent(search)}&page=${page}&size=10`
        : `/api/v1/listings?page=${page}&size=10`;
      const res = await axios.get(url);
      setListings(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchListings();
  };

  const categoryColors = {
    ELECTRONICS: 'bg-blue-500/10 text-blue-400',
    SPORTS_OUTDOORS: 'bg-orange-500/10 text-orange-400',
    HOME_GARDEN: 'bg-green-500/10 text-green-400',
    SKILLS_EDUCATION: 'bg-purple-500/10 text-purple-400',
    SERVICES: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">CoopConnect AI</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-green-400" />
            Browse Listings
          </h1>
          <p className="text-slate-400 mt-1">Discover items, services, and skills to exchange</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-green-400 transition"
              placeholder="Search listings..."
            />
          </div>
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg transition">
            Search
          </button>
        </form>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">No listings found</h3>
            <p className="text-slate-400 mt-1">Try adjusting your search or check back later</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-green-400/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[listing.category] || 'bg-slate-500/10 text-slate-400'}`}>
                      {listing.category?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">{listing.type}</span>
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-green-400 transition">{listing.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{listing.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{listing.locationText || 'Not specified'}</span>
                    </div>
                    {listing.estimatedValue && (
                      <span className="text-green-400 font-semibold">{listing.estimatedValue}€</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
                    <span>by {listing.ownerUsername}</span>
                    <div className="flex gap-2">
                      <span>{listing.viewsCount || 0} views</span>
                      <span>❤ {listing.likesCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${page === i ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Listings;
