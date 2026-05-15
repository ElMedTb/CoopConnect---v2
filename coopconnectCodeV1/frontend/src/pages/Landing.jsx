import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, ArrowRight, RefreshCw, MapPin, ShieldCheck, Sparkles, Users, Package, TrendingUp } from 'lucide-react'

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-card">
      <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-forest-700" />
      </div>
      <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
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
            <span className="font-semibold text-stone-900">CoopConnect AI</span>
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
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-forest-50 text-forest-800 text-xs font-medium px-3 py-1.5 rounded-full border border-forest-200 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Matching intelligent par l'IA
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight mb-5">
          Transformez vos surplus
          <br />
          en opportunités
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed mb-8">
          CoopConnect AI connecte entreprises, coopératives et particuliers pour valoriser
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

      {/* Stats */}
      <section className="bg-white border-y border-stone-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="2 400+" label="Utilisateurs actifs" />
            <StatItem value="8 700+" label="Annonces publiées" />
            <StatItem value="1 200+" label="Échanges réalisés" />
            <StatItem value="42 t" label="CO2 évité" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm leading-relaxed">
            Une plateforme complète pour structurer et optimiser vos échanges économiques.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={Sparkles}
            title="Matching IA"
            description="Notre moteur analyse vos annonces et détecte automatiquement les meilleures correspondances en combinant similarité de contenu, proximité géographique et complémentarité."
          />
          <FeatureCard
            icon={RefreshCw}
            title="Économie circulaire"
            description="Transformez vos surplus, stocks dormants et capacités inutilisées en ressources valorisées. Réduisez le gaspillage et les coûts logistiques."
          />
          <FeatureCard
            icon={MapPin}
            title="Réseau local"
            description="Connectez-vous avec des partenaires proches de vous. Notre scoring géographique favorise les échanges de proximité pour réduire l'impact carbone."
          />
          <FeatureCard
            icon={Users}
            title="Multi-acteurs"
            description="Particuliers, TPE, PME, coopératives et associations. Toutes les formes de coopération économique en un seul endroit."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Échanges sécurisés"
            description="Workflow d'échange complet avec gestion des accords, suivi en temps réel, système d'avis et résolution des litiges."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Prédictions marché"
            description="Anticipez les tendances locales et identifiez les opportunités avant vos concurrents grâce à nos analyses prédictives."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-100 border-y border-stone-200 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Comment ça marche</h2>
            <p className="text-stone-500 text-sm">En trois étapes simples</p>
          </div>
          <div className="space-y-6 max-w-lg mx-auto">
            <StepItem
              number="1"
              title="Publiez vos ressources"
              description="Décrivez ce que vous offrez ou ce dont vous avez besoin : objets, services, compétences, espaces, surplus de production."
            />
            <StepItem
              number="2"
              title="L'IA trouve les meilleures correspondances"
              description="Notre algorithme analyse votre annonce et détecte automatiquement les partenaires les plus pertinents dans votre région."
            />
            <StepItem
              number="3"
              title="Échangez en toute confiance"
              description="Contactez vos matchs, négociez les termes et formalisez votre accord via notre workflow sécurisé."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-forest-800 rounded-2xl px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Prêt à rejoindre le mouvement ?</h2>
          <p className="text-forest-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Rejoignez des milliers d'acteurs économiques marocains qui coopèrent intelligemment
            grâce à CoopConnect AI.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-forest-800 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-forest-50 transition-colors">
            Créer mon compte gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-forest-800 rounded-md flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-stone-600 font-medium">CoopConnect AI</span>
          </div>
          <p className="text-xs text-stone-400">
            MIAGE Université Côte d'Azur — EMSI 2025-2026
          </p>
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
