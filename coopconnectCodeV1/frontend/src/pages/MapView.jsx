import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsApi } from '../api/listings'
import { Navigation } from 'lucide-react'

const CATEGORY_COLORS = {
  ELECTRONICS:      '#3b82f6',
  CLOTHING:         '#ec4899',
  HOME_GARDEN:      '#22c55e',
  TOOLS:            '#f97316',
  SERVICES:         '#8b5cf6',
  SKILLS_EDUCATION: '#06b6d4',
  SPORTS_OUTDOORS:  '#eab308',
  BOOKS_MEDIA:      '#6366f1',
  TRANSPORTATION:   '#14b8a6',
  REAL_ESTATE:      '#64748b',
  HEALTH_BEAUTY:    '#f43f5e',
  AUTOMOTIVE:       '#78716c',
  OTHER:            '#059669',
}

const CATEGORY_LABELS = {
  ELECTRONICS: 'Électronique', CLOTHING: 'Vêtements', HOME_GARDEN: 'Maison',
  TOOLS: 'Outillage', SERVICES: 'Services', SKILLS_EDUCATION: 'Compétences',
  SPORTS_OUTDOORS: 'Sport', BOOKS_MEDIA: 'Livres', TRANSPORTATION: 'Transport',
  REAL_ESTATE: 'Immobilier', HEALTH_BEAUTY: 'Santé', AUTOMOTIVE: 'Auto', OTHER: 'Autre',
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function MapView() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [userPos, setUserPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [count, setCount] = useState(0)

  // Charger les annonces
  useEffect(() => {
    listingsApi.getAll({ size: 300 })
      .then(res => {
        const items = (res.data?.content || []).filter(l => l.latitude && l.longitude)
        setListings(items)
        setCount(items.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Initialiser la carte Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Charger Leaflet dynamiquement (évite les conflits SSR/Vite)
    import('leaflet').then(({ default: L }) => {
      // Fix icônes
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center: [31.5, -6.5], // Centre Maroc
        zoom: 6,
        zoomControl: true,
      })

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © <a href="https://www.esri.com/">Esri</a>',
          maxZoom: 19,
        }
      ).addTo(map)

      mapInstanceRef.current = { map, L }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Mettre à jour les marqueurs quand les données ou le filtre changent
  useEffect(() => {
    if (!mapInstanceRef.current || listings.length === 0) return
    const { map, L } = mapInstanceRef.current

    // Supprimer anciens marqueurs
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filtered = activeCategory
      ? listings.filter(l => l.category === activeCategory)
      : listings

    setCount(filtered.length)

    filtered.forEach(listing => {
      const color = CATEGORY_COLORS[listing.category] || '#059669'
      const catLabel = CATEGORY_LABELS[listing.category] || listing.category || ''

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:26px;height:26px;
          background:${color};
          border:2.5px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
          cursor:pointer;
        "></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -28],
      })

      const dist = userPos
        ? distanceKm(userPos[0], userPos[1], listing.latitude, listing.longitude)
        : null

      const distHtml = dist !== null
        ? `<p style="font-size:11px;color:#15803d;font-weight:600;margin:2px 0 6px">
            ${dist < 1 ? 'Moins d\'1 km' : dist.toFixed(1) + ' km de vous'}
           </p>`
        : ''

      const popup = L.popup({ maxWidth: 250 }).setContent(`
        <div style="font-family:system-ui,sans-serif;padding:4px 2px">
          <span style="
            display:inline-block;background:${color};color:white;
            font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;margin-bottom:6px
          ">${catLabel}</span>
          <p style="font-weight:700;font-size:13px;color:#1c1917;margin:0 0 4px;line-height:1.3">
            ${listing.title}
          </p>
          ${listing.locationText ? `<p style="font-size:11px;color:#78716c;margin:0 0 2px">📍 ${listing.locationText}</p>` : ''}
          ${distHtml}
          ${listing.ownerName ? `<p style="font-size:11px;color:#a8a29e;margin:0 0 8px">Par ${listing.ownerName}</p>` : ''}
          <button
            onclick="window.__mapNavigate('${listing.id}')"
            style="
              width:100%;padding:6px 12px;background:${color};color:white;
              border:none;border-radius:8px;font-size:12px;font-weight:600;
              cursor:pointer;text-align:center
            "
          >Voir l'annonce →</button>
        </div>
      `)

      const marker = L.marker([listing.latitude, listing.longitude], { icon }).bindPopup(popup)
      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }, [listings, activeCategory, userPos])

  // Exposer navigate pour les popups (bouton HTML pur)
  useEffect(() => {
    window.__mapNavigate = (id) => navigate(`/listings/${id}`)
    return () => { delete window.__mapNavigate }
  }, [navigate])

  const handleLocate = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const { map, L } = mapInstanceRef.current
        const coords = [latitude, longitude]
        setUserPos(coords)

        // Marqueur utilisateur
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:16px;height:16px;background:#2563eb;border:3px solid white;
            border-radius:50%;box-shadow:0 0 0 5px rgba(37,99,235,0.2)
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        L.marker(coords, { icon: userIcon })
          .bindPopup('<b>Ma position</b>')
          .addTo(map)
        L.circle(coords, { radius: 5000, color: '#2563eb', fillOpacity: 0.06, weight: 1 }).addTo(map)
        map.flyTo(coords, 12, { duration: 1.2 })
        setLocating(false)
      },
      () => {
        alert("Impossible d'obtenir votre position.")
        setLocating(false)
      }
    )
  }

  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>

      {/* Barre de contrôle */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e7e5e4',
        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        overflowX: 'auto',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', whiteSpace: 'nowrap' }}>
          🗺️ Carte · <span style={{ color: '#78716c', fontWeight: 400 }}>{count} annonces</span>
        </span>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button
            onClick={() => setActiveCategory('')}
            style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              border: '1.5px solid', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeCategory === '' ? '#166534' : 'white',
              color: activeCategory === '' ? 'white' : '#57534e',
              borderColor: activeCategory === '' ? '#166534' : '#d6d3d1',
            }}
          >Toutes</button>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
              style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                border: '1.5px solid', cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeCategory === cat ? (CATEGORY_COLORS[cat] || '#059669') : 'white',
                color: activeCategory === cat ? 'white' : '#57534e',
                borderColor: activeCategory === cat ? (CATEGORY_COLORS[cat] || '#059669') : '#d6d3d1',
              }}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleLocate}
          disabled={locating}
          style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            border: '1.5px solid #d6d3d1', background: 'white', color: '#57534e',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          <Navigation size={13} style={{ animation: locating ? 'spin 1s linear infinite' : 'none' }} />
          {locating ? 'Localisation...' : 'Ma position'}
        </button>
      </div>

      {/* Conteneur carte */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, background: '#f5f5f4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 32, height: 32, border: '3px solid #166534',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 8px',
              }} />
              <p style={{ fontSize: 13, color: '#78716c' }}>Chargement des annonces...</p>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-container { font-family: system-ui, sans-serif; }
        .leaflet-tile { max-width: none !important; }
        .leaflet-popup-content { margin: 10px 12px; }
      `}</style>
    </div>
  )
}
