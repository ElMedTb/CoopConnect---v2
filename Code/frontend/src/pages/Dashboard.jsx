import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, Package, Handshake, Leaf, Building2, TrendingUp, TrendingDown, Bell, ChevronRight, Plus, Recycle, Zap } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's organization
        const orgRes = await axios.get('/api/v1/organizations/mine');
        if (orgRes.status === 200 && orgRes.data) {
          setOrg(orgRes.data);
          // Fetch org resources
          const resRes = await axios.get(`/api/v1/resources/org/${orgRes.data.id}?size=5`);
          setResources(resRes.data.content || []);
        }
        // Fetch all platform resources for recommendations
        const allRes = await axios.get('/api/v1/resources?size=5');
        setAllResources(allRes.data.content || []);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div></div>;

  const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mt-3">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      {subtext && <p className="text-xs text-emerald-400 mt-1">{subtext}</p>}
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-emerald-400" />
            Tableau de bord
          </h1>
          <p className="text-slate-400 mt-1">
            {org ? org.name : `Bienvenue, ${user?.firstName || user?.username} !`}
          </p>
        </div>
        <Link to="/create-resource" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition">
          <Plus className="w-4 h-4" /> Publier une ressource
        </Link>
      </div>

      {/* Notifications Mock */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-amber-400" /> Notifications
          <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">3</span>
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Handshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">Nouvelle opportunité de partenariat détectée par l'IA</p>
            <span className="text-xs text-slate-500 ml-auto">Il y a 2h</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">Alerte surplus : 500kg tomates disponibles à Nice</p>
            <span className="text-xs text-slate-500 ml-auto">Il y a 5h</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">Prédiction : hausse demande légumes bio +15% ce trimestre</p>
            <span className="text-xs text-slate-500 ml-auto">Hier</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Ressources actives" value={resources.length || allResources.length} color="bg-blue-500/20" />
        <StatCard icon={Handshake} label="Partenariats" value={org?.partnershipsCount || 0} color="bg-purple-500/20" />
        <StatCard icon={Leaf} label="CO₂ évité" value={org?.co2SavedKg ? `${(org.co2SavedKg / 1000).toFixed(1)}t` : '0t'} subtext="Impact positif" color="bg-emerald-500/20" />
        <StatCard icon={Recycle} label="Déchets valorisés" value={org?.wasteRecycledPct ? `${org.wasteRecycledPct}%` : '—'} color="bg-amber-500/20" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My resources */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Mes ressources</h3>
            <Link to="/resources" className="text-emerald-400 text-sm flex items-center gap-1 hover:text-emerald-300 transition">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {resources.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Pas encore de ressources. Publiez votre premier surplus !</p>
          ) : (
            <div className="space-y-2">
              {resources.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  <div>
                    <p className="text-white text-sm font-medium">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.resourceType === 'SURPLUS' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {r.resourceType === 'SURPLUS' ? 'Surplus' : r.resourceType === 'NEED' ? 'Besoin' : 'Production'}
                      </span>
                      {r.quantity && <span className="text-xs text-slate-400">{r.quantity} {r.unit}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{r.viewsCount} vues</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended resources on platform */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Dernières annonces</h3>
            <Link to="/resources" className="text-emerald-400 text-sm flex items-center gap-1 hover:text-emerald-300 transition">
              Explorer <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {allResources.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <div>
                  <p className="text-white text-sm font-medium">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.resourceType === 'SURPLUS' ? 'bg-emerald-500/15 text-emerald-400' : r.resourceType === 'NEED' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {r.resourceType === 'SURPLUS' ? '↑ Surplus' : r.resourceType === 'NEED' ? '↓ Besoin' : '⟳ Production'}
                    </span>
                    <span className="text-xs text-slate-500">{r.organizationName}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{r.organizationCity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact banner */}
      {org && (
        <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <Leaf className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">Impact environnemental de {org.name}</h3>
          <p className="text-slate-400 text-sm mb-4">Grâce à vos échanges circulaires sur CoopConnect AI</p>
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{org.co2SavedKg ? `${(org.co2SavedKg / 1000).toFixed(1)}` : '0'}</p>
              <p className="text-xs text-slate-400">tonnes CO₂ évitées</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{org.wasteRecycledPct || 0}%</p>
              <p className="text-xs text-slate-400">déchets valorisés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{org.partnershipsCount || 0}</p>
              <p className="text-xs text-slate-400">partenariats actifs</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
