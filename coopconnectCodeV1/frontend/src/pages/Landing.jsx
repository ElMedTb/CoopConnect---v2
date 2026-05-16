import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, ArrowRight, RefreshCw, MapPin, ShieldCheck, Sparkles, Package } from 'lucide-react'

function MockListing() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-card p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-stone-500" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-stone-900 leading-snug">Palettes bois EUR — 20 unités</h4>
          <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" aria-hidden="true" /> Casablanca · Outillage
          </p>
        </div>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed mb-3">
        Stock récupéré après réorganisation d'entrepôt. Palettes Europe en bon état, idéales pour usage logistique ou aménagement d'espace.
      </p>
      <div className="flex gap-1.5">
        <span className="badge-green text-xs">Bon état</span>
        <span className="badge-stone text-xs">Objet</span>
      </div>
    </div>
  )
}

function MockMatch({ score, title, explanation, distance, dim = false }) {
  const scoreColor = score >= 75 ? 'text-forest-700 bg-forest-50' : 'text-amber-700 bg-amber-50'
  return (
    <div className={`bg-white rounded-xl border border-stone-200 shadow-card p-4 ${dim ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center ${scoreColor}`}>
          <span className="text-sm font-bold leading-none">{score}</span>
          <span className="text-xs">%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-forest-600 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-stone-900 line-clamp-1">{title}</p>
          </div>
          <p className="text-xs text-stone-500 italic leading-relaxed mb-2">{explanation}</p>
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            <span>{distance} km</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturePill({ icon: Icon, title, description }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-forest-700 shrink-0" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      </div>
      <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
    </div>
  )
}

function StepItem({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-stone-900 mb-1">{title}</h4>
        <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-800 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900">CoopConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Connexion
            </Link>
            <Link to="/register" className="btn-primary text-xs px-3 py-1.5">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-5">
          Transformez vos surplus
          <br />
          en opportunités
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed mb-8">
          CoopConnect connecte entreprises, coopératives et particuliers pour valoriser
          leurs ressources, réduire le gaspillage et développer des partenariats durables
          au Maroc.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary px-6 py-3 text-sm">
            Rejoindre la plateforme
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/browse" className="btn-secondary px-6 py-3 text-sm">
            Explorer les annonces
          </Link>
        </div>
      </section>

      {/* Proof bar */}
      <section className="bg-white border-y border-stone-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-stone-500 leading-relaxed max-w-2xl mx-auto">
            Rejoints par{' '}
            <span className="font-semibold text-stone-800">2 400 acteurs économiques</span>
            {' '}— entreprises, coopératives et particuliers — qui ont publié{' '}
            <span className="font-semibold text-stone-800">8 700 annonces</span>,{' '}
            réalisé <span className="font-semibold text-stone-800">1 200 échanges</span>{' '}
            et évité <span className="font-semibold text-stone-800">42 t de CO₂</span>.
          </p>
        </div>
      </section>

      {/* Product demo */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">
            De l'annonce au match en quelques minutes
          </h2>
          <p className="text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
            L'IA analyse contenu, catégorie et proximité géographique pour détecter les correspondances les plus pertinentes dans votre région.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Votre annonce</p>
            <MockListing />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Ce que l'IA détecte</p>
            <div className="space-y-3">
              <MockMatch
                score={87}
                title="Coopérative Transport Atlas"
                explanation="Cherche palettes en bon état pour flotte logistique régionale. Correspondance contenu et proximité élevées."
                distance={8}
              />
              <MockMatch
                score={64}
                title="Entrepôt Aïn Sebaâ Distribution"
                explanation="Besoin régulier de palettes Europe pour réception de marchandises entrantes."
                distance={23}
                dim
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-stone-100">
          <FeaturePill
            icon={RefreshCw}
            title="Économie circulaire"
            description="Transformez surplus, stocks dormants et capacités inutilisées en ressources valorisées. Réduisez gaspillage et coûts logistiques."
          />
          <FeaturePill
            icon={MapPin}
            title="Réseau local"
            description="Le scoring géographique favorise les échanges de proximité pour réduire l'impact carbone et les délais de transfert."
          />
          <FeaturePill
            icon={ShieldCheck}
            title="Échanges sécurisés"
            description="Workflow complet : accords formalisés, messagerie intégrée, suivi en temps réel et résolution des litiges."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-100 border-y border-stone-200 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-stone-900 mb-6 text-center">Comment ça marche</h2>
          <div className="space-y-5 max-w-lg mx-auto">
            <StepItem
              number="1"
              title="Publiez votre annonce"
              description="Décrivez précisément ce que vous offrez ou ce dont vous avez besoin. Plus la description est détaillée, plus les correspondances IA seront pertinentes."
            />
            <StepItem
              number="2"
              title="L'IA analyse et classe"
              description="Notre moteur combine similarité de contenu, catégorie, proximité géographique et complémentarité pour classer les meilleures correspondances dans votre région."
            />
            <StepItem
              number="3"
              title="Proposez un échange"
              description="Contactez la contrepartie de votre choix depuis la plateforme. Gérez l'accord, la messagerie et le suivi dans un workflow dédié."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-8 text-center">
        <div className="bg-forest-800 rounded-2xl px-8 py-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Prêt à rejoindre le mouvement ?</h2>
          <p className="text-forest-200 text-sm mb-5 max-w-md mx-auto leading-relaxed">
            Rejoignez des milliers d'acteurs économiques marocains qui coopèrent
            grâce à CoopConnect.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-forest-800 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-forest-50 transition-colors">
            Créer mon compte gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-forest-800 rounded-md flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-stone-600 font-medium">CoopConnect</span>
          </div>
          <div className="flex gap-4 text-xs text-stone-400">
            <Link to="/browse" className="hover:text-stone-600 transition-colors">Annonces</Link>
            <Link to="/login" className="hover:text-stone-600 transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-stone-600 transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
