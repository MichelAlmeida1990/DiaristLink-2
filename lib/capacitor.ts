import { Capacitor } from '@capacitor/core'

/**
 * Verifica se está rodando no Capacitor (app mobile)
 */
export const isCapacitor = () => Capacitor.isNativePlatform()

/**
 * Verifica se está rodando no iOS
 */
export const isIOS = () => Capacitor.getPlatform() === 'ios'

/**
 * Verifica se está rodando no Android
 */
export const isAndroid = () => Capacitor.getPlatform() === 'android'

/**
 * Verifica se está rodando no navegador (web)
 */
export const isWeb = () => Capacitor.getPlatform() === 'web'

/**
 * Obtém a plataforma atual
 */
export const getPlatform = () => Capacitor.getPlatform()




