import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight, Package } from 'lucide-react'

const CATEGORY_LABELS = {
  ELECTRONICS:      'Électronique',
  CLOTHING:         'Vêtements',
  HOME_GARDEN:      'Maison & Jardin',
  SPORTS_OUTDOORS:  'Sport',
  BOOKS_MEDIA:      'Livres & Médias',
  TOYS_GAMES:       'Jouets & Jeux',
  HEALTH_BEAUTY:    'Santé & Beauté',
  AUTOMOTIVE:       'Automobile',
  TOOLS:            'Outillage',
  SERVICES:         'Services',
  SKILLS_EDUCATION: 'Compétences',
  TRANSPORTATION:   'Transport',
  REAL_ESTATE:      'Immobilier',
  PETS:             'Animaux',
  OTHER:            'Autre',
}

const TYPE_LABELS = {
  ITEM:      'Objet',
  SERVICE:   'Service',
  SKILL:     'Compétence',
  SPACE:     'Espace',
  TRANSPORT: 'Transport',
}

const CONDITION_LABELS = {
  NEW:      'Neuf',
  LIKE_NEW: 'Comme neuf',
  EXCELLENT:'Excellent',
  GOOD:     'Bon état',
  FAIR:     'Correct',
  POOR:     'Passable',
}

// Eco panel variant cycles a→b→c→d based on category initial
const PANEL_VARIANTS = ['a', 'b', 'c', 'd']
function getPanelVariant(category) {
  const keys = Object.keys(CATEGORY_LABELS)
  return PANEL_VARIANTS[keys.indexOf(category) % 4] || 'a'
}

export default function ListingCard({ listing }) {
  const category  = CATEGORY_LABELS[listing.category] || listing.category
  const type      = TYPE_LABELS[listing.type] || listing.type
  const condition = CONDITION_LABELS[listing.condition]
  const variant   = getPanelVariant(listing.category)

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card block hover:shadow-card-hover hover:-translate-y-px transition-all duration-200 group overflow-hidden"
    >
      {/* Eco-gradient panel */}
      <div
        className={`eco-panel-${variant} relative h-20 flex items-center justify-between px-4 border-b border-stone-200 overflow-hidden`}
        aria-hidden="true"
      >
        {/* Paper-texture overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(54,70,40,0.04) 0 1px, transparent 1px 14px)',
        }} />
        {/* Category icon */}
        <div className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-forest-700 border border-white/20"
             style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(2px)' }}>
          <Package className="w-4 h-4" />
        </div>
        {/* Category pill */}
        {category && (
          <span className="relative text-[11px] font-semibold uppercase tracking-wide text-forest-700 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.65)', letterSpacing: '0.07em' }}>
            {category}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-stone-800 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-forest-700 transition-colors">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
          {listing.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {type && type !== 'Objet' && (
            <span className="badge-stone text-xs">{type}</span>
          )}
          {condition && (
            <span className="badge-green text-xs">{condition}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            {listing.locationText && (
              <>
                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>{listing.locationText}</span>
              </>
            )}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-forest-600 transition-colors" aria-hidden="true" />
        </div>
      </div>

      {/* Owner strip */}
      {listing.ownerName && (
        <div className="px-4 py-2 border-t border-stone-200 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-[10px] text-forest-700 font-semibold">
            {listing.ownerName.charAt(0)}
          </div>
          <span className="text-xs text-stone-500">{listing.ownerName}</span>
        </div>
      )}
    </Link>
  )
}
