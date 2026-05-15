import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'

const CATEGORY_LABELS = {
  ELECTRONICS: 'Électronique',
  CLOTHING: 'Vêtements',
  HOME_GARDEN: 'Maison & Jardin',
  SPORTS_OUTDOORS: 'Sport',
  BOOKS_MEDIA: 'Livres & Médias',
  TOYS_GAMES: 'Jouets & Jeux',
  HEALTH_BEAUTY: 'Santé & Beauté',
  AUTOMOTIVE: 'Automobile',
  TOOLS: 'Outillage',
  SERVICES: 'Services',
  SKILLS_EDUCATION: 'Compétences',
  TRANSPORTATION: 'Transport',
  REAL_ESTATE: 'Immobilier',
  PETS: 'Animaux',
  OTHER: 'Autre',
}

const TYPE_LABELS = {
  ITEM: 'Objet',
  SERVICE: 'Service',
  SKILL: 'Compétence',
  SPACE: 'Espace',
  TRANSPORT: 'Transport',
}

const CONDITION_LABELS = {
  NEW: 'Neuf',
  LIKE_NEW: 'Comme neuf',
  EXCELLENT: 'Excellent',
  GOOD: 'Bon état',
  FAIR: 'Correct',
  POOR: 'Passable',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

export default function ListingCard({ listing }) {
  const category = CATEGORY_LABELS[listing.category] || listing.category
  const type = TYPE_LABELS[listing.type] || listing.type
  const condition = CONDITION_LABELS[listing.condition]

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card block hover:shadow-card-hover transition-shadow duration-200 group"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-forest-800 transition-colors">
              {listing.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
          {listing.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {category && (
            <span className="badge-stone text-xs">{category}</span>
          )}
          {type && type !== 'ITEM' && (
            <span className="badge-stone text-xs">{type}</span>
          )}
          {condition && (
            <span className="badge-green text-xs">{condition}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            {listing.locationText && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.locationText}
              </span>
            )}
            {listing.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(listing.createdAt)}
              </span>
            )}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-forest-700 transition-colors" />
        </div>
      </div>

      {/* Owner strip */}
      {listing.ownerName && (
        <div className="px-4 py-2 border-t border-stone-100 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-xs text-stone-500 font-medium">
            {listing.ownerName.charAt(0)}
          </div>
          <span className="text-xs text-stone-500">{listing.ownerName}</span>
        </div>
      )}
    </Link>
  )
}
