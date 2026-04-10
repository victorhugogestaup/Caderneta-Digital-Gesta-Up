import { useState, useEffect, useCallback } from 'react'

interface UpdateInfo {
  waiting: ServiceWorker | null
  isUpdateAvailable: boolean
}

export function useServiceWorkerUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    waiting: null,
    isUpdateAvailable: false
  })
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)

  // Verificar se há dismiss temporário
  const shouldShowUpdate = useCallback(() => {
    if (!updateInfo.isUpdateAvailable) return false
    
    if (!dismissedAt) return true
    
    const thirtyMinutes = 30 * 60 * 1000
    const timeSinceDismiss = Date.now() - dismissedAt
    
    return timeSinceDismiss >= thirtyMinutes
  }, [updateInfo.isUpdateAvailable, dismissedAt])

  // Aplicar atualização
  const applyUpdate = useCallback(() => {
    if (updateInfo.waiting) {
      updateInfo.waiting.postMessage({ type: 'SKIP_WAITING' })
      // Recarregar a página para aplicar a atualização
      window.location.reload()
    }
  }, [updateInfo.waiting])

  // Dismiss temporário
  const dismissUpdate = useCallback(() => {
    setDismissedAt(Date.now())
    setShowUpdateBanner(false)
  }, [])

  // Forçar verificação
  const forceCheck = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update()
        })
      })
    }
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Recuperar dismiss do localStorage
    const savedDismiss = localStorage.getItem('sw-update-dismissed')
    if (savedDismiss) {
      setDismissedAt(parseInt(savedDismiss, 10))
    }

    // Registrar listener para atualizações do Service Worker
    const handleSWUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      const { waiting } = customEvent.detail
      
      setUpdateInfo({
        waiting,
        isUpdateAvailable: !!waiting
      })
    }

    // Listener para quando o Service Worker ativa
    const handleSWActivated = () => {
      // Limpar dismiss ao atualizar
      localStorage.removeItem('sw-update-dismissed')
      setDismissedAt(null)
    }

    window.addEventListener('sw-update-available', handleSWUpdate)
    window.addEventListener('sw-activated', handleSWActivated)

    // Verificar se já há um SW esperando
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration?.waiting) {
        setUpdateInfo({
          waiting: registration.waiting,
          isUpdateAvailable: true
        })
      }
    })

    // Verificar ao ganhar foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        forceCheck()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate)
      window.removeEventListener('sw-activated', handleSWActivated)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [forceCheck])

  // Atualizar estado do banner baseado no dismiss
  useEffect(() => {
    setShowUpdateBanner(shouldShowUpdate())
  }, [shouldShowUpdate])

  // Salvar dismiss no localStorage
  useEffect(() => {
    if (dismissedAt) {
      localStorage.setItem('sw-update-dismissed', dismissedAt.toString())
    }
  }, [dismissedAt])

  return {
    isUpdateAvailable: updateInfo.isUpdateAvailable,
    waitingSW: updateInfo.waiting,
    showUpdateBanner,
    applyUpdate,
    dismissUpdate,
    forceCheck
  }
}
