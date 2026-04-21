import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, ArrowLeft, TrendingUp, TrendingDown, Repeat, MapPin, Truck, Check } from 'lucide-react';

const RESOURCE_TYPES = [
  { key: 'SURPLUS', label: 'Surplus', icon: TrendingUp, desc: 'Vous avez un excédent à proposer', color: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30 text-emerald-400' },
  { key: 'NEED', label: 'Besoin', icon: TrendingDown, desc: 'Vous recherchez une ressource', color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30 text-amber-400' },
  { key: 'PRODUCTION', label: 'Production', icon: Repeat, desc: 'Vous produisez régulièrement', color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30 text-blue-400' },
];

const CATEGORIES = [
  { key: 'ALIMENTAIRE', label: '🥬 Alimentaire' },
  { key: 'MATERIEL', label: '🔧 Matériel' },
  { key: 'EQUIPEMENT', label: '⚙️ Équipement' },
  { key: 'MATIERE_PREMIERE', label: '🪨 Matière première' },
  { key: 'DECHET_VALORISABLE', label: '♻️ Déchet valorisable' },
  { key: 'ENERGIE', label: '⚡ Énergie' },
  { key: 'LOGISTIQUE', label: '🚛 Logistique' },
  { key: 'COMPETENCE', label: '🎓 Compétence / Service' },
  { key: 'ESPACE', label: '🏢 Espace / Local' },
  { key: 'VEHICULE', label: '🚗 Véhicule' },
  { key: 'AUTRE', label: '📦 Autre' },
];

const UNITS = ['kg', 'tonnes', 'litres', 'm3', 'unités', 'heures', 'jours', 'MWh', 'véhicules', 'palettes'];
const CONDITIONS = ['Neuf', 'Excellent', 'Bon état', 'Correct', 'À recycler'];
const FREQUENCIES = [
  { key: 'quotidien', label: 'Quotidien' },
  { key: 'hebdomadaire', label: 'Hebdomadaire' },
  { key: 'mensuel', label: 'Mensuel' },
  { key: 'saisonnier', label: 'Saisonnier' },
  { key: 'ponctuel', label: 'Ponctuel (une fois)' },
];

const CreateResource = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [org, setOrg] = useState(null);

  const [form, setForm] = useState({
    name: '', description: '', resourceType: '', category: '',
    quantity: '', unit: 'kg', estimatedValue: '', conditionState: '',
    isRecurring: false, recurringFrequency: '', locationText: '',
    deliveryAvailable: false, pickupOnly: true, maxDeliveryKm: '',
  });

  useEffect(() => {
    axios.get('/api/v1/organizations/mine')
      .then(res => { if (res.data) setOrg(res.data); })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.resourceType || !form.category) {
      setError('Veuillez remplir le nom, le type et la catégorie'); return;
    }
    if (!org) {
      setError("Vous devez d'abord créer votre organisation (via l'inscription)"); return;
    }

    setLoading(true); setError('');
    try {
      await axios.post('/api/v1/resources', {
        name: form.name,
        description: form.description,
        resourceType: form.resourceType,
        category: form.category,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        unit: form.unit,
        estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : null,
        conditionState: form.conditionState || null,
        isRecurring: form.isRecurring,
        recurringFrequency: form.isRecurring ? form.recurringFrequency : null,
        locationText: form.locationText || (org?.city || ''),
        deliveryAvailable: form.deliveryAvailable,
        pickupOnly: form.pickupOnly,
        maxDeliveryKm: form.maxDeliveryKm ? parseInt(form.maxDeliveryKm) : null,
      });
      setSuccess(true);
      setTimeout(() => navigate('/resources'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm";

  if (success) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Annonce publiée !</h2>
        <p className="text-slate-400">Votre ressource est maintenant visible sur la plateforme. Redirection...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Publier une annonce</h1>
          <p className="text-sm text-slate-400">{org ? org.name : 'Décrivez votre surplus ou besoin'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-5">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Resource Type */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">Type d'annonce *</label>
          <div className="grid grid-cols-3 gap-3">
            {RESOURCE_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} type="button" onClick={() => setForm({ ...form, resourceType: t.key })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.resourceType === t.key ? `bg-gradient-to-br ${t.color} border-2` : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                  }`}>
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${form.resourceType === t.key ? '' : 'text-slate-400'}`} />
                  <p className={`font-semibold text-sm ${form.resourceType === t.key ? '' : 'text-white'}`}>{t.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">Catégorie *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button" onClick={() => setForm({ ...form, category: c.key })}
                className={`p-2.5 rounded-lg text-xs text-left border transition ${
                  form.category === c.key ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Titre de l'annonce *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass}
            placeholder="Ex: Tomates bio surplus saisonnier" required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className={inputClass + " resize-none"} placeholder="Détaillez la quantité, la qualité, les conditions d'échange..." />
        </div>

        {/* Quantity + Unit + Value */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Quantité</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={inputClass} placeholder="500" step="any" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Unité</label>
            <select name="unit" value={form.unit} onChange={handleChange} className={inputClass + " appearance-none"}>
              {UNITS.map(u => <option key={u} value={u} className="bg-slate-800">{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Valeur estimée (€)</label>
            <input type="number" name="estimatedValue" value={form.estimatedValue} onChange={handleChange} className={inputClass} placeholder="0" step="any" />
          </div>
        </div>

        {/* Condition (only for surplus) */}
        {form.resourceType !== 'NEED' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">État / Condition</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, conditionState: c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.conditionState === c ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recurring */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-400" />
            <label className="text-sm text-slate-300">Disponibilité récurrente</label>
          </div>
          {form.isRecurring && (
            <div className="flex flex-wrap gap-2 ml-7">
              {FREQUENCIES.map(f => (
                <button key={f.key} type="button" onClick={() => setForm({ ...form, recurringFrequency: f.key })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.recurringFrequency === f.key ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Localisation</label>
          <input type="text" name="locationText" value={form.locationText} onChange={handleChange} className={inputClass}
            placeholder={org?.city ? `${org.city} (par défaut)` : "Ville ou zone"} />
        </div>

        {/* Delivery */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handleChange}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-400" />
            <label className="text-sm text-slate-300 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Livraison possible</label>
          </div>
          {form.deliveryAvailable && (
            <div className="flex items-center gap-2">
              <input type="number" name="maxDeliveryKm" value={form.maxDeliveryKm} onChange={handleChange}
                className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 transition" placeholder="50" />
              <span className="text-xs text-slate-400">km max</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-50">
          {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <>Publier l'annonce <Check className="w-5 h-5" /></>}
        </button>
      </form>
    </main>
  );
};

export default CreateResource;
