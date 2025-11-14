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
    rating?: number
    isAvailable?: boolean
    isVerified?: boolean
    pulse?: boolean
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
      
      {markers.length > 0 && markers.map((marker) => {
        // Determinar cor baseado na disponibilidade
        const markerColor = marker.isAvailable === false 
          ? "#ef4444" // Vermelho para ocupado
          : marker.isAvailable === true 
            ? "#10b981" // Verde para disponível
            : marker.color || "#3b82f6" // Azul padrão
        
        // Classe CSS para animação pulsante
        const pulseClass = marker.pulse ? "pulse-animation" : ""
        
        // Badge de rating
        const ratingBadge = marker.rating 
          ? `<div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: #fbbf24;
              color: white;
              border-radius: 12px;
              padding: 2px 6px;
              font-size: 10px;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              gap: 2px;
            ">
              ⭐ ${marker.rating.toFixed(1)}
            </div>`
          : ""
        
        // Badge de verificado
        const verifiedBadge = marker.isVerified
          ? `<div style="
              position: absolute;
              top: -8px;
              left: -8px;
              background: #10b981;
              color: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ✓
            </div>`
          : ""

        // Determinar se é um marcador de job (sem avatar_url geralmente indica job)
        const isJobMarker = !marker.avatar_url && marker.title
        
        const CustomIcon = L.divIcon({
          className: `custom-marker ${pulseClass}`,
          html: `
            <div style="
              position: relative;
              width: ${isJobMarker ? '56px' : '48px'};
              height: ${isJobMarker ? '56px' : '48px'};
            ">
              ${marker.pulse ? `
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: ${isJobMarker ? '56px' : '48px'};
                  height: ${isJobMarker ? '56px' : '48px'};
                  border-radius: 50%;
                  background: ${markerColor};
                  opacity: 0.3;
                  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                "></div>
              ` : ""}
              <div style="
                position: relative;
                width: ${isJobMarker ? '56px' : '48px'};
                height: ${isJobMarker ? '56px' : '48px'};
                border-radius: ${isJobMarker ? '12px' : '50%'};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                overflow: hidden;
                background: ${markerColor};
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1;
              ">
                ${marker.avatar_url 
                  ? `<img src="${marker.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;" />`
                  : isJobMarker
                    ? `<div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 20px;
                        line-height: 1;
                      ">
                        💼
                        <span style="font-size: 10px; margin-top: 2px;">${marker.title?.substring(0, 2).toUpperCase() || "J"}</span>
                      </div>`
                    : `<span style="color: white; font-weight: bold; font-size: 18px;">${marker.title?.charAt(0).toUpperCase() || "?"}</span>`
                }
              </div>
              ${ratingBadge}
              ${verifiedBadge}
            </div>
            <style>
              @keyframes pulse-ring {
                0% {
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 0.3;
                }
                50% {
                  transform: translate(-50%, -50%) scale(1.3);
                  opacity: 0.1;
                }
                100% {
                  transform: translate(-50%, -50%) scale(1.5);
                  opacity: 0;
                }
              }
              .pulse-animation {
                animation: pulse-marker 2s ease-in-out infinite;
              }
              @keyframes pulse-marker {
                0%, 100% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.1);
                }
              }
            </style>
          `,
          iconSize: isJobMarker ? [56, 56] : [48, 48],
          iconAnchor: isJobMarker ? [28, 56] : [24, 48],
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
