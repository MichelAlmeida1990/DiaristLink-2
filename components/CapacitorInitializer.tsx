"use client"

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { isCapacitor } from '@/lib/capacitor'

/**
 * Componente que inicializa recursos do Capacitor quando rodando em app mobile
 */
export default function CapacitorInitializer() {
  useEffect(() => {
    if (!isCapacitor()) {
      return // Não fazer nada se não estiver no Capacitor
    }

    const initializeCapacitor = async () => {
      try {
        // Configurar StatusBar
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#1E3A8A' })

        // Esconder splash screen após carregar
        await SplashScreen.hide()

        // Configurar botão voltar do Android
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp()
          } else {
            window.history.back()
          }
        })

        // Listener para quando o app volta ao foco
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            console.log('App está ativo')
          }
        })
      } catch (error) {
        console.error('Erro ao inicializar Capacitor:', error)
      }
    }

    initializeCapacitor()

    // Cleanup
    return () => {
      App.removeAllListeners()
    }
  }, [])

  return null // Componente não renderiza nada
}




