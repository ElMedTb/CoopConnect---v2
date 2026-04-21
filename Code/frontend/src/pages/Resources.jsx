import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Package, ArrowUpDown, Filter, MapPin, Building2, TrendingUp, TrendingDown, Repeat, X } from 'lucide-react';

const typeConfig = {
  SURPLUS: { label: 'Surplus', icon: TrendingUp, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  NEED: { label: 'Besoin', icon: TrendingDown, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  PRODUCTION: { label: 'Production', icon: Repeat, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
};

const categoryLabels = {
  ALIMENTAIRE: '🥬 Alimentaire', MATERIEL: '🔧 Matériel', EQUIPEMENT: '⚙️ Équipement',
  MATIERE_PREMIERE: '🪨 Matière première', DECHET_VALORISABLE: '♻️ Déchet valorisable',
  ENERGIE: '⚡ Énergie', LOGISTIQUE: '🚛 Logistique', COMPETENCE: '🎓 Compétence',
  ESPACE: '🏢 Espace', VEHICULE: '🚗 Véhicule', AUTRE: '📦 Autre',
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => { fetchResources(); }, [page, typeFilter, categoryFilter]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let url;
      if (search) {
        url = `/api/v1/resources/search?q=${encodeURIComponent(search)}&page=${page}&size=12`;
      } else if (typeFilter) {
        url = `/api/v1/resources/type/${typeFilter}?page=${page}&size=12`;
      } else if (categoryFilter) {
        url = `/api/v1/resources/category/${categoryFilter}?page=${page}&size=12`;
      } else {
        url = `/api/v1/resources?page=${page}&size=12`;
      }
      const res = await axios.get(url);
      setResources(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setTypeFilter('');
    setCategoryFilter('');
    fetchResources();
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    setPage(0);
  };

  const hasFilters = search || typeFilter || categoryFilter;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Échangez vos <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">surplus</span>, trouvez ce qu'il vous faut
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Plateforme d'échanges entre coopératives, PME, TPE et entreprises. Publiez vos surplus, trouvez des ressources, créez des partenariats circulaires.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            placeholder="Rechercher des ressources..." />
        </div>
        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition">
          Rechercher
        </button>
      </form>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-slate-500" />
        {/* Type filters */}
        {Object.entries(typeConfig).map(([key, { label, color }]) => (
          <button key={key} onClick={() => { setTypeFilter(typeFilter === key ? '' : key); setCategoryFilter(''); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${typeFilter === key ? color : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
            {label}
          </button>
        ))}
        <span className="text-slate-600 mx-1">|</span>
        {/* Category filters */}
        {Object.entries(categoryLabels).slice(0, 6).map(([key, label]) => (
          <button key={key} onClick={() => { setCategoryFilter(categoryFilter === key ? '' : key); setTypeFilter(''); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${categoryFilter === key ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
            {label}
          </button>
        ))}
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition flex items-center gap-1">
            <X className="w-3 h-3" /> Effacer
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{totalElements} ressource{totalElements !== 1 ? 's' : ''} disponible{totalElements !== 1 ? 's' : ''}</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">Aucune ressource trouvée</h3>
          <p className="text-slate-400 mt-2">Essayez d'ajuster vos filtres de recherche</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => {
              const tc = typeConfig[r.resourceType] || typeConfig.SURPLUS;
              const TypeIcon = tc.icon;
              return (
                <div key={r.id} className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 group">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${tc.color}`}>
                      <TypeIcon className="w-3.5 h-3.5" /> {tc.label}
                    </span>
                    <span className="text-xs text-slate-500">{categoryLabels[r.category] || r.category}</span>
                  </div>

                  {/* Title & description */}
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-emerald-400 transition line-clamp-1">{r.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{r.description}</p>

                  {/* Quantity & value */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    {r.quantity && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">{r.quantity}</span>
                        <span className="text-slate-400">{r.unit}</span>
                      </div>
                    )}
                    {r.estimatedValue > 0 && (
                      <span className="text-slate-300 font-medium">{r.estimatedValue}€</span>
                    )}
                    {r.isRecurring && (
                      <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full">🔄 {r.recurringFrequency}</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-slate-400">{r.organizationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{r.organizationCity || r.locationText}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${page === i ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Resources;
