import { Geolocation } from '@capacitor/geolocation'
import { isCapacitor } from './capacitor'

export interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy?: number
}

export async function getCurrentPosition(): Promise<GeolocationPosition> {
  // Se estiver rodando no Capacitor (app mobile), usar plugin nativo
  if (isCapacitor()) {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      })
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }
    } catch (error: any) {
      throw new Error(error.message || "Erro ao obter localização")
    }
  }

  // Caso contrário, usar API do navegador
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada pelo navegador"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

export function watchPosition(
  callback: (position: GeolocationPosition) => void
): number | null {
  // Se estiver rodando no Capacitor, usar plugin nativo
  if (isCapacitor()) {
    Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
      (position, err) => {
        if (err) {
          console.error("Erro ao obter localização:", err)
          return
        }
        if (position) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        }
      }
    )
    // Retornar um ID simbólico (o Capacitor gerencia internamente)
    return -1
  }

  // Caso contrário, usar API do navegador
  if (!navigator.geolocation) {
    throw new Error("Geolocalização não suportada pelo navegador")
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
    },
    (error) => {
      console.error("Erro ao obter localização:", error)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
}

export function clearWatch(watchId: number | null) {
  if (watchId === null || watchId === -1) {
    // Capacitor gerencia internamente, não precisa limpar
    return
  }
  navigator.geolocation.clearWatch(watchId)
}

// Calcular distância entre dois pontos (Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distância em km
}

