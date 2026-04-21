import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Users, Building2, Package, Handshake, TrendingUp, BarChart3 } from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState({ users: 0, orgs: 0, resources: 0 });
  const [orgs, setOrgs] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orgRes, resRes] = await Promise.all([
          axios.get('/api/v1/organizations?size=100'),
          axios.get('/api/v1/resources?size=100'),
        ]);
        setOrgs(orgRes.data.content || []);
        setResources(resRes.data.content || []);
        setStats({
          orgs: orgRes.data.totalElements || 0,
          resources: resRes.data.totalElements || 0,
        });
      } catch (err) {
        console.error('Admin error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div></div>;

  const totalCO2 = orgs.reduce((sum, o) => sum + (o.co2SavedKg || 0), 0);
  const totalPartnerships = orgs.reduce((sum, o) => sum + (o.partnershipsCount || 0), 0);
  const surplusCount = resources.filter(r => r.resourceType === 'SURPLUS').length;
  const needCount = resources.filter(r => r.resourceType === 'NEED').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
        Panel Administrateur
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Building2, label: 'Organisations', value: stats.orgs, color: 'bg-blue-500/20' },
          { icon: Package, label: 'Ressources', value: stats.resources, color: 'bg-emerald-500/20' },
          { icon: Handshake, label: 'Partenariats', value: totalPartnerships, color: 'bg-purple-500/20' },
          { icon: TrendingUp, label: 'CO₂ évité (kg)', value: totalCO2.toLocaleString(), color: 'bg-amber-500/20' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-400" /> Répartition des ressources</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-400">Surplus</span>
                <span className="text-slate-400">{surplusCount}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${stats.resources ? (surplusCount / stats.resources * 100) : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-amber-400">Besoins</span>
                <span className="text-slate-400">{needCount}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${stats.resources ? (needCount / stats.resources * 100) : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-400">Production</span>
                <span className="text-slate-400">{stats.resources - surplusCount - needCount}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${stats.resources ? ((stats.resources - surplusCount - needCount) / stats.resources * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-400" /> Organisations par type</h3>
          <div className="space-y-3">
            {Object.entries(
              orgs.reduce((acc, o) => { acc[o.orgType] = (acc[o.orgType] || 0) + 1; return acc; }, {})
            ).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-slate-300">{type}</span>
                <span className="text-sm font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 overflow-x-auto">
        <h3 className="text-white font-semibold mb-4">Toutes les organisations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="pb-3 pr-4">Nom</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Secteur</th>
              <th className="pb-3 pr-4">Ville</th>
              <th className="pb-3 pr-4">Partenariats</th>
              <th className="pb-3">CO₂ (kg)</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-3 pr-4 text-white font-medium">{o.name}</td>
                <td className="py-3 pr-4 text-slate-400">{o.orgType}</td>
                <td className="py-3 pr-4 text-slate-400">{o.sector}</td>
                <td className="py-3 pr-4 text-slate-400">{o.city}</td>
                <td className="py-3 pr-4 text-slate-300">{o.partnershipsCount || 0}</td>
                <td className="py-3 text-emerald-400">{o.co2SavedKg?.toLocaleString() || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AdminPanel;
