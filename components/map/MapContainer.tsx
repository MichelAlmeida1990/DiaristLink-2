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
    avatar_url?: string
    color?: string
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
      
      {markers.map((marker) => {
        const CustomIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              overflow: hidden;
              background: ${marker.color || "#3b82f6"};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${marker.avatar_url 
                ? `<img src="${marker.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;" />`
                : `<span style="color: white; font-weight: bold; font-size: 16px;">${marker.title?.charAt(0).toUpperCase() || "?"}</span>`
              }
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        })

        return (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={CustomIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(marker.id),
            }}
          >
            {marker.title && (
              <Popup>
                <div className="min-w-[200px]">
                  {marker.avatar_url && (
                    <img 
                      src={marker.avatar_url} 
                      alt={marker.title}
                      className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                    />
                  )}
                  <h3 className="font-semibold text-center">{marker.title}</h3>
                  {marker.description && (
                    <p className="text-sm text-gray-600 text-center mt-1">{marker.description}</p>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        )
      })}
    </LeafletMapContainer>
  )
}
