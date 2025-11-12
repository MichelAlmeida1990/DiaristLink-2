"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"

interface MapControllerWrapperProps {
  center: [number, number]
}

export function MapControllerWrapper({ center }: MapControllerWrapperProps) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])

  return null
}

