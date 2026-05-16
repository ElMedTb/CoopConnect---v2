import React, { useEffect, useRef, useState } from 'react'
import { Navigation, MapPin } from 'lucide-react'

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
    )
    const data = await res.json()
    const a = data.address || {}
    const city = a.city || a.town || a.village || a.municipality || ''
    const country = a.country || ''
    return [city, country].filter(Boolean).join(', ') ||
      data.display_name?.split(',')[0] ||
      `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

export default function LocationPicker({ latitude, longitude, locationText, onChange }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const placeRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const [locating, setLocating] = useState(false)

  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(({ default: L }) => {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = latitude && longitude ? [latitude, longitude] : [31.5, -6.5]
      const zoom = latitude && longitude ? 13 : 6

      const map = L.map(mapRef.current, { center, zoom })
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 19 }
      ).addTo(map)

      const place = async (lat, lng) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)
          markerRef.current.on('dragend', async (e) => {
            const { lat: la, lng: lo } = e.target.getLatLng()
            const text = await reverseGeocode(la, lo)
            onChangeRef.current({ latitude: la, longitude: lo, locationText: text })
          })
        }
        const text = await reverseGeocode(lat, lng)
        onChangeRef.current({ latitude: lat, longitude: lng, locationText: text })
      }

      placeRef.current = place

      if (latitude && longitude) {
        place(latitude, longitude)
      }

      map.on('click', (e) => {
        place(e.latlng.lat, e.latlng.lng)
      })

      mapInstanceRef.current = { map, L }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove()
        mapInstanceRef.current = null
        markerRef.current = null
        placeRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocate = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        mapInstanceRef.current.map.flyTo([lat, lng], 13, { duration: 1 })
        if (placeRef.current) await placeRef.current(lat, lng)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">Localisation</label>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="text-xs text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Navigation className="w-3 h-3" aria-hidden="true" />
          {locating ? 'Localisation...' : 'Utiliser ma position'}
        </button>
      </div>
      <p className="text-xs text-stone-500 mb-2">
        Cliquez sur la carte pour définir l'emplacement, ou faites glisser le marqueur.
      </p>
      <div ref={mapRef} className="h-52 w-full rounded-xl border border-stone-200 overflow-hidden" />
      <p className="text-xs mt-1.5 flex items-center gap-1">
        {locationText ? (
          <>
            <MapPin className="w-3 h-3 text-forest-600 shrink-0" aria-hidden="true" />
            <span className="text-stone-600">{locationText}</span>
          </>
        ) : (
          <span className="text-stone-400">Aucun emplacement sélectionné</span>
        )}
      </p>
    </div>
  )
}
