import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, TrendingUp, Sparkles, ArrowLeftRight, CheckCircle } from 'lucide-react'
import { exchangesApi } from '../../api/users'

function ScoreBar({ label, value }) {
  const pct = Math.round((value || 0) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-forest-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-stone-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

// Normalise les clés snake_case → camelCase depuis l'API matching
export function normalizeMatch(m) {
  return {
    listingId: m.listing_id || m.listingId || '',
    score: m.score || 0,
    scoreBreakdown: {
      contentSimilarity: m.score_breakdown?.content_similarity ?? m.scoreBreakdown?.contentSimilarity ?? 0,
      categoryMatch: m.score_breakdown?.category_match ?? m.scoreBreakdown?.categoryMatch ?? 0,
      geoScore: m.score_breakdown?.geo_score ?? m.scoreBreakdown?.geoScore ?? 0,
      complementarity: m.score_breakdown?.complementarity ?? m.scoreBreakdown?.complementarity ?? 0,
      priceProximity: m.score_breakdown?.price_proximity ?? m.scoreBreakdown?.priceProximity ?? 0,
    },
    distanceKm: m.distance_km ?? m.distanceKm ?? null,
    explanation: m.explanation || '',
    title: m.title || null,
  }
}

export default function MatchCard({ match: rawMatch, showExchange = false, myListingTitle = '' }) {
  const match = normalizeMatch(rawMatch)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const scorePct = Math.round(match.score * 100)
  const scoreColor =
    scorePct >= 75 ? 'text-forest-700 bg-forest-50' :
    scorePct >= 50 ? 'text-amber-700 bg-amber-50' :
    'text-stone-600 bg-stone-50'

  const handleExchange = async () => {
    if (!match.listingId) return
    setSending(true)
    try {
      const message = myListingTitle
        ? `Bonjour, je souhaite échanger "${myListingTitle}" contre votre annonce.`
        : "Bonjour, votre annonce m'intéresse, souhaitez-vous échanger ?"
      await exchangesApi.create({ listingId: match.listingId, message })
      setSent(true)
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la demande d'échange.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card p-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${scoreColor}`}>
          <span className="text-sm font-bold">{scorePct}</span>
          <span className="text-xs">%</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-forest-600 shrink-0" />
            <h4 className="text-sm font-medium text-stone-900 line-clamp-1">
              {match.title || (match.listingId ? `Annonce #${match.listingId.slice(0, 8)}` : 'Correspondance IA')}
            </h4>
          </div>

          <p className="text-xs text-stone-500 mb-2 italic leading-relaxed">{match.explanation}</p>

          {match.distanceKm !== null && match.distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-xs text-stone-400 mb-3">
              <MapPin className="w-3 h-3" />
              {match.distanceKm < 1 ? 'Moins d\'1 km' : `${match.distanceKm.toFixed(1)} km`}
            </div>
          )}

          <div className="space-y-1 mb-3">
            <ScoreBar label="Contenu" value={match.scoreBreakdown.contentSimilarity} />
            <ScoreBar label="Catégorie" value={match.scoreBreakdown.categoryMatch} />
            <ScoreBar label="Proximité" value={match.scoreBreakdown.geoScore} />
            <ScoreBar label="Complémentarité" value={match.scoreBreakdown.complementarity} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {match.listingId && (
              <Link
                to={`/listings/${match.listingId}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-700 hover:text-forest-900 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Voir l'annonce
              </Link>
            )}

            {showExchange && match.listingId && (
              sent ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-forest-700">
                  <CheckCircle className="w-3.5 h-3.5" /> Demande envoyée
                </span>
              ) : (
                <button
                  onClick={handleExchange}
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors disabled:opacity-50"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {sending ? 'Envoi...' : 'Proposer un échange'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
