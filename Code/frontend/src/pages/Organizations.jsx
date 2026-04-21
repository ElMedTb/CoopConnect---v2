import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, Search, MapPin, Users, Calendar, Star, Handshake, Leaf } from 'lucide-react';

const orgTypeLabels = {
  COOPERATIVE: { label: 'Coopérative', color: 'bg-emerald-500/15 text-emerald-400' },
  PME: { label: 'PME', color: 'bg-blue-500/15 text-blue-400' },
  TPE: { label: 'TPE', color: 'bg-purple-500/15 text-purple-400' },
  GRANDE_ENTREPRISE: { label: 'Grande Entreprise', color: 'bg-orange-500/15 text-orange-400' },
  ASSOCIATION: { label: 'Association', color: 'bg-pink-500/15 text-pink-400' },
  ARTISAN: { label: 'Artisan', color: 'bg-amber-500/15 text-amber-400' },
  AUTO_ENTREPRENEUR: { label: 'Auto-entrepreneur', color: 'bg-cyan-500/15 text-cyan-400' },
  COLLECTIVITE: { label: 'Collectivité', color: 'bg-rose-500/15 text-rose-400' },
};

const sectorLabels = {
  AGRICULTURE: '🌾', AGROALIMENTAIRE: '🍽️', ARTISANAT: '🔨', RESTAURATION: '🍳',
  LOGISTIQUE: '🚛', ENERGIE: '⚡', EDUCATION: '📚', SERVICES: '💼',
  DISTRIBUTION: '🏪', BTP: '🏗️', TEXTILE: '👕', TECHNOLOGIE: '💻',
  SANTE: '🏥', TOURISME: '✈️', AUTRE: '📋',
};

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => { fetchOrgs(); }, [page, typeFilter]);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      let url;
      if (search) {
        url = `/api/v1/organizations/search?q=${encodeURIComponent(search)}&page=${page}&size=12`;
      } else if (typeFilter) {
        url = `/api/v1/organizations/type/${typeFilter}?page=${page}&size=12`;
      } else {
        url = `/api/v1/organizations?page=${page}&size=12`;
      }
      const res = await axios.get(url);
      setOrgs(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setTypeFilter('');
    fetchOrgs();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Annuaire des <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">organisations</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Découvrez les coopératives, PME, TPE et entreprises de la plateforme. Trouvez des partenaires pour vos échanges.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 transition"
            placeholder="Rechercher une organisation..." />
        </div>
        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition">
          Rechercher
        </button>
      </form>

      {/* Type filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Object.entries(orgTypeLabels).map(([key, { label, color }]) => (
          <button key={key} onClick={() => { setTypeFilter(typeFilter === key ? '' : key); setSearch(''); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${typeFilter === key ? color + ' border-current' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-400 mb-4">{totalElements} organisation{totalElements !== 1 ? 's' : ''}</p>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div></div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">Aucune organisation trouvée</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orgs.map((org) => {
            const t = orgTypeLabels[org.orgType] || orgTypeLabels.COOPERATIVE;
            return (
              <div key={org.id} className="bg-white/[0.03] backdrop-blur border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-xl flex items-center justify-center text-2xl">
                    {sectorLabels[org.sector] || '🏢'}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.color}`}>{t.label}</span>
                </div>

                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-emerald-400 transition">{org.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{org.description}</p>

                {/* Values */}
                {org.valuesLabels && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {org.valuesLabels.split(',').slice(0, 3).map((v, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">{v.trim()}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white font-bold text-sm">{org.partnershipsCount || 0}</p>
                    <p className="text-slate-500 text-xs">Partenariats</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white font-bold text-sm">{org.ratingAverage?.toFixed(1) || '—'}</p>
                    <p className="text-slate-500 text-xs">Note</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-emerald-400 font-bold text-sm">{org.co2SavedKg ? `${(org.co2SavedKg / 1000).toFixed(1)}t` : '—'}</p>
                    <p className="text-slate-500 text-xs">CO₂ évité</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {org.city}, {org.region}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {org.memberCount || '—'} membres
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Organizations;
