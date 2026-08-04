import { useSystemParams } from '@/hooks/use-system-params'
import { cn } from '@/lib/utils'
import type { MapMarker } from '@/lib/logistics-types'

interface LogisticsMapProps {
  markers?: MapMarker[]
  origin?: string
  destination?: string
  waypoints?: string[]
  query?: string
  height?: string
  className?: string
}

export function LogisticsMap({
  markers,
  origin,
  destination,
  waypoints,
  query,
  height = '300px',
  className,
}: LogisticsMapProps) {
  const { getParam } = useSystemParams()
  const provider = getParam('logistics', 'map_provider', 'osm')
  const apiKey = getParam('logistics', 'map_api_key', '')

  let src = ''

  if (provider === 'google' && apiKey) {
    if (origin && destination) {
      const params = new URLSearchParams({ key: apiKey, origin, destination })
      if (waypoints?.length) params.set('waypoints', waypoints.join('|'))
      src = `https://www.google.com/maps/embed/v1/directions?${params.toString()}`
    } else if (markers?.length) {
      src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${markers[0].lat},${markers[0].lng}`
    } else if (query) {
      src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}`
    }
  } else if (markers?.length) {
    const lats = markers.map((m) => m.lat)
    const lngs = markers.map((m) => m.lng)
    const pad = 0.015
    const minLat = Math.min(...lats) - pad
    const maxLat = Math.max(...lats) + pad
    const minLng = Math.min(...lngs) - pad
    const maxLng = Math.max(...lngs) + pad
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${markers[0].lat},${markers[0].lng}`
  }

  if (!src) return null

  return (
    <div
      className={cn('rounded-lg overflow-hidden border-2 border-[#005B2E]/20', className)}
      style={{ height }}
    >
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        title="Mapa Logístico"
      />
    </div>
  )
}
