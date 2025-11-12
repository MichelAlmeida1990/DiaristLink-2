"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para ícones padrão do Leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

// Importação dinâmica do react-leaflet para evitar problemas de SSR
const LeafletMapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

const MapControllerWrapper = dynamic(
  () => import("./MapControllerWrapper").then((mod) => ({ default: mod.MapControllerWrapper })),
  { ssr: false }
)

interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    id: string
    position: [number, number]
    title?: string
    description?: string
  }>
  onMarkerClick?: (markerId: string) => void
  className?: string
}

export default function MapContainer({
  center = [-23.5505, -46.6333], // São Paulo por padrão
  zoom = 13,
  markers = [],
  onMarkerClick,
  className = "h-[400px] w-full rounded-lg",
}: MapContainerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    )
  }

  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapControllerWrapper center={center} />
      
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id),
          }}
        >
          {marker.title && (
            <Popup>
              <div>
                <h3 className="font-semibold">{marker.title}</h3>
                {marker.description && (
                  <p className="text-sm text-gray-600">{marker.description}</p>
                )}
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </LeafletMapContainer>
  )
}
