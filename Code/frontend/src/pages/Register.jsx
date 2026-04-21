import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Recycle, UserPlus, Mail, Lock, User, Phone, Building2, ArrowRight, ArrowLeft, Check, MapPin, Globe, Hash, Calendar, Users } from 'lucide-react';

// ─── Predefined categories per org type ─────────────────────────
const ORG_TYPES = [
  { key: 'COOPERATIVE', label: 'Coopérative', icon: '🤝', desc: 'Coopérative agricole, artisanale, de services...', color: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30' },
  { key: 'PME', label: 'PME', icon: '🏢', desc: 'Petite ou moyenne entreprise (10-249 salariés)', color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30' },
  { key: 'TPE', label: 'TPE', icon: '🏪', desc: 'Très petite entreprise (< 10 salariés)', color: 'from-purple-500/20 to-violet-600/20 border-purple-500/30' },
  { key: 'GRANDE_ENTREPRISE', label: 'Grande Entreprise', icon: '🏛️', desc: 'Entreprise de 250+ salariés', color: 'from-orange-500/20 to-amber-600/20 border-orange-500/30' },
  { key: 'ASSOCIATION', label: 'Association / ONG', icon: '💚', desc: 'Association loi 1901, ONG, fondation', color: 'from-pink-500/20 to-rose-600/20 border-pink-500/30' },
  { key: 'ARTISAN', label: 'Artisan', icon: '🔨', desc: 'Artisan indépendant, chambre des métiers', color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30' },
  { key: 'AUTO_ENTREPRENEUR', label: 'Auto-entrepreneur', icon: '💼', desc: 'Micro-entreprise, freelance', color: 'from-cyan-500/20 to-teal-600/20 border-cyan-500/30' },
  { key: 'COLLECTIVITE', label: 'Collectivité', icon: '🏫', desc: 'Collectivité territoriale, mairie, communauté de communes', color: 'from-rose-500/20 to-red-600/20 border-rose-500/30' },
];

const SECTORS = {
  COOPERATIVE: [
    { key: 'AGRICULTURE', label: '🌾 Agriculture' },
    { key: 'AGROALIMENTAIRE', label: '🍽️ Agroalimentaire' },
    { key: 'ARTISANAT', label: '🔨 Artisanat' },
    { key: 'DISTRIBUTION', label: '🏪 Distribution' },
    { key: 'ENERGIE', label: '⚡ Énergie' },
    { key: 'SERVICES', label: '💼 Services' },
    { key: 'BTP', label: '🏗️ BTP' },
    { key: 'EDUCATION', label: '📚 Éducation' },
  ],
  PME: [
    { key: 'AGROALIMENTAIRE', label: '🍽️ Agroalimentaire' },
    { key: 'RESTAURATION', label: '🍳 Restauration' },
    { key: 'LOGISTIQUE', label: '🚛 Logistique & Transport' },
    { key: 'TECHNOLOGIE', label: '💻 Technologie & IT' },
    { key: 'BTP', label: '🏗️ BTP & Construction' },
    { key: 'SERVICES', label: '💼 Services aux entreprises' },
    { key: 'SANTE', label: '🏥 Santé' },
    { key: 'TEXTILE', label: '👕 Textile' },
    { key: 'TOURISME', label: '✈️ Tourisme & Hôtellerie' },
  ],
  TPE: [
    { key: 'RESTAURATION', label: '🍳 Restauration' },
    { key: 'ARTISANAT', label: '🔨 Artisanat' },
    { key: 'SERVICES', label: '💼 Services' },
    { key: 'AGRICULTURE', label: '🌾 Agriculture' },
    { key: 'DISTRIBUTION', label: '🏪 Commerce de détail' },
    { key: 'TECHNOLOGIE', label: '💻 Tech & Web' },
  ],
  GRANDE_ENTREPRISE: [
    { key: 'AGROALIMENTAIRE', label: '🍽️ Agroalimentaire' },
    { key: 'LOGISTIQUE', label: '🚛 Logistique' },
    { key: 'ENERGIE', label: '⚡ Énergie' },
    { key: 'TECHNOLOGIE', label: '💻 Technologie' },
    { key: 'BTP', label: '🏗️ BTP & Industrie' },
    { key: 'DISTRIBUTION', label: '🏪 Grande distribution' },
    { key: 'SANTE', label: '🏥 Santé & Pharma' },
    { key: 'TEXTILE', label: '👕 Textile & Mode' },
  ],
  ASSOCIATION: [
    { key: 'EDUCATION', label: '📚 Éducation & Formation' },
    { key: 'SERVICES', label: '💼 Action sociale' },
    { key: 'SANTE', label: '🏥 Santé' },
    { key: 'AGRICULTURE', label: '🌾 Environnement' },
    { key: 'DISTRIBUTION', label: '🏪 Aide alimentaire' },
    { key: 'TOURISME', label: '✈️ Culture & Loisirs' },
  ],
  ARTISAN: [
    { key: 'ARTISANAT', label: '🔨 Artisanat d\'art' },
    { key: 'BTP', label: '🏗️ Bâtiment' },
    { key: 'AGROALIMENTAIRE', label: '🍽️ Boulangerie / Food artisanal' },
    { key: 'TEXTILE', label: '👕 Textile & Couture' },
    { key: 'SERVICES', label: '💼 Services à la personne' },
  ],
  AUTO_ENTREPRENEUR: [
    { key: 'TECHNOLOGIE', label: '💻 Développement / IT' },
    { key: 'SERVICES', label: '💼 Conseil & Services' },
    { key: 'ARTISANAT', label: '🔨 Artisanat' },
    { key: 'EDUCATION', label: '📚 Formation' },
    { key: 'AUTRE', label: '📋 Autre' },
  ],
  COLLECTIVITE: [
    { key: 'SERVICES', label: '💼 Services publics' },
    { key: 'EDUCATION', label: '📚 Éducation' },
    { key: 'LOGISTIQUE', label: '🚛 Transport public' },
    { key: 'ENERGIE', label: '⚡ Énergie & Déchets' },
    { key: 'BTP', label: '🏗️ Aménagement' },
  ],
};

const VALUES_OPTIONS = [
  'Bio', 'Local', 'Circuit court', 'Commerce équitable', 'Zéro déchet',
  'Anti-gaspillage', 'Énergie renouvelable', 'Insertion sociale',
  'Développement durable', 'Économie circulaire', 'Made in France',
  'Artisanat', 'Innovation', 'Solidarité'
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = choose type, 2 = user info, 3 = org info
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // User fields
  const [userData, setUserData] = useState({ username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phoneNumber: '' });
  // Org fields
  const [orgData, setOrgData] = useState({ name: '', description: '', sector: '', siret: '', website: '', phone: '', contactEmail: '', address: '', city: '', region: '', postalCode: '', memberCount: '', yearFounded: '', selectedValues: [] });

  const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
  const handleOrgChange = (e) => setOrgData({ ...orgData, [e.target.name]: e.target.value });

  const toggleValue = (val) => {
    setOrgData(prev => ({
      ...prev,
      selectedValues: prev.selectedValues.includes(val)
        ? prev.selectedValues.filter(v => v !== val)
        : [...prev.selectedValues, val]
    }));
  };

  const validateStep2 = () => {
    if (!userData.username || !userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      setError('Veuillez remplir tous les champs obligatoires'); return false;
    }
    if (userData.password !== userData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return false; }
    if (userData.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return false; }
    setError(''); return true;
  };

  const handleSubmit = async () => {
    if (!orgData.name || !orgData.sector) { setError('Veuillez renseigner le nom et le secteur de votre organisation'); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Register user
      const userType = selectedType === 'ASSOCIATION' ? 'NON_PROFIT' : 'BUSINESS';
      const regRes = await register({ ...userData, userType });
      const token = regRes?.accessToken || localStorage.getItem('token');

      // 2. Create organization
      if (token) {
        await axios.post('/api/v1/organizations', {
          name: orgData.name,
          description: orgData.description,
          orgType: selectedType,
          sector: orgData.sector,
          siret: orgData.siret || null,
          website: orgData.website || null,
          phone: orgData.phone || userData.phoneNumber || null,
          contactEmail: orgData.contactEmail || userData.email,
          address: orgData.address || null,
          city: orgData.city || null,
          region: orgData.region || null,
          country: 'France',
          postalCode: orgData.postalCode || null,
          memberCount: orgData.memberCount ? parseInt(orgData.memberCount) : null,
          yearFounded: orgData.yearFounded ? parseInt(orgData.yearFounded) : null,
          valuesLabels: orgData.selectedValues.join(', ') || null,
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm";
  const inputClassSimple = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-500/20">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Rejoignez <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">CoopConnect AI</span></h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s ? 'bg-emerald-500 text-white scale-110' : step > s ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 text-slate-500'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`}></div>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>}

          {/* ═══════ STEP 1: Choose org type ═══════ */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Quel type d'organisation êtes-vous ?</h2>
              <p className="text-sm text-slate-400 mb-6">Sélectionnez le type qui correspond le mieux à votre structure</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ORG_TYPES.map(t => (
                  <button key={t.key} onClick={() => { setSelectedType(t.key); setError(''); }}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedType === t.key
                        ? `bg-gradient-to-br ${t.color} border-2 scale-[1.02] shadow-lg`
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{t.label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => { if (!selectedType) { setError('Veuillez choisir un type d\'organisation'); return; } setStep(2); }}
                className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition">
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* ═══════ STEP 2: User account ═══════ */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Votre compte {ORG_TYPES.find(t => t.key === selectedType)?.icon}
              </h2>
              <p className="text-sm text-slate-400 mb-6">Informations du responsable de l'organisation</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Prénom *</label>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="firstName" value={userData.firstName} onChange={handleUserChange} className={inputClass} placeholder="Prénom" required /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nom *</label>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="lastName" value={userData.lastName} onChange={handleUserChange} className={inputClass} placeholder="Nom" required /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nom d'utilisateur *</label>
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" name="username" value={userData.username} onChange={handleUserChange} className={inputClass} placeholder="Identifiant de connexion" required /></div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email professionnel *</label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" name="email" value={userData.email} onChange={handleUserChange} className={inputClass} placeholder="contact@votre-organisation.fr" required /></div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Téléphone</label>
                  <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" name="phoneNumber" value={userData.phoneNumber} onChange={handleUserChange} className={inputClass} placeholder="+33..." /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mot de passe *</label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" name="password" value={userData.password} onChange={handleUserChange} className={inputClass} placeholder="Min 8 car." required /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Confirmer *</label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" name="confirmPassword" value={userData.confirmPassword} onChange={handleUserChange} className={inputClass} placeholder="Confirmer" required /></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={() => { if (validateStep2()) setStep(3); }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition">
                  Continuer <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {/* ═══════ STEP 3: Organization details (dynamic per type) ═══════ */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                {ORG_TYPES.find(t => t.key === selectedType)?.icon} Votre {ORG_TYPES.find(t => t.key === selectedType)?.label}
              </h2>
              <p className="text-sm text-slate-400 mb-6">Décrivez votre organisation pour être visible sur la plateforme</p>

              <div className="space-y-4">
                {/* Org Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nom de {selectedType === 'COOPERATIVE' ? 'la coopérative' : selectedType === 'ASSOCIATION' ? "l'association" : selectedType === 'ARTISAN' ? "l'atelier / entreprise" : 'l\'entreprise'} *
                  </label>
                  <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" name="name" value={orgData.name} onChange={handleOrgChange} className={inputClass}
                      placeholder={selectedType === 'COOPERATIVE' ? 'Ex: Coopérative Bio du Sud' : selectedType === 'ARTISAN' ? 'Ex: Menuiserie Martin' : 'Ex: Solutions Vertes SAS'} required /></div>
                </div>

                {/* Sector — predefined per org type */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Secteur d'activité *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(SECTORS[selectedType] || SECTORS.PME).map(s => (
                      <button key={s.key} type="button" onClick={() => setOrgData({ ...orgData, sector: s.key })}
                        className={`p-2.5 rounded-lg text-xs text-left border transition ${
                          orgData.sector === s.key ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea name="description" value={orgData.description} onChange={handleOrgChange} rows={3}
                    className={inputClassSimple + " resize-none"} placeholder="Décrivez votre activité, vos produits, vos valeurs..." />
                </div>

                {/* SIRET (not for associations/auto-entrepreneurs) */}
                {!['ASSOCIATION', 'AUTO_ENTREPRENEUR'].includes(selectedType) && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">N° SIRET</label>
                    <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="siret" value={orgData.siret} onChange={handleOrgChange} className={inputClass} placeholder="123 456 789 01234" /></div>
                  </div>
                )}

                {/* Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Ville *</label>
                    <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="city" value={orgData.city} onChange={handleOrgChange} className={inputClass} placeholder="Nice" /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Région</label>
                    <input type="text" name="region" value={orgData.region} onChange={handleOrgChange} className={inputClassSimple} placeholder="PACA" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Code postal</label>
                    <input type="text" name="postalCode" value={orgData.postalCode} onChange={handleOrgChange} className={inputClassSimple} placeholder="06000" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Adresse</label>
                    <input type="text" name="address" value={orgData.address} onChange={handleOrgChange} className={inputClassSimple} placeholder="12 Rue des Fleurs" />
                  </div>
                </div>

                {/* Extra fields per type */}
                <div className="grid grid-cols-2 gap-3">
                  {['COOPERATIVE', 'PME', 'GRANDE_ENTREPRISE', 'ASSOCIATION'].includes(selectedType) && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de membres</label>
                      <div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="number" name="memberCount" value={orgData.memberCount} onChange={handleOrgChange} className={inputClass} placeholder="25" /></div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Année de création</label>
                    <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="yearFounded" value={orgData.yearFounded} onChange={handleOrgChange} className={inputClass} placeholder="2020" /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Site web</label>
                  <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" name="website" value={orgData.website} onChange={handleOrgChange} className={inputClass} placeholder="https://..." /></div>
                </div>

                {/* Values / Labels */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Vos valeurs (sélectionnez celles qui vous correspondent)</label>
                  <div className="flex flex-wrap gap-2">
                    {VALUES_OPTIONS.map(v => (
                      <button key={v} type="button" onClick={() => toggleValue(v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          orgData.selectedValues.includes(v) ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <>Créer mon compte <Check className="w-5 h-5" /></>}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-slate-400 text-sm mt-6">
            Déjà inscrit ? <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
