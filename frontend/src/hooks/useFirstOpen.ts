import { useState, useEffect } from 'react'

export function useFirstOpen() {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se é a primeira abertura (browser ou PWA)
    const checkFirstOpen = () => {
      const welcomeSeen = localStorage.getItem('welcome-seen')
      
      // Mostrar welcome se nunca viu a tela de boas-vindas
      // (funciona tanto no browser quanto no PWA instalado)
      const shouldShow = !welcomeSeen
      
      setShouldShowWelcome(shouldShow)
      setIsLoading(false)
    }

    // Pequeno delay para garantir que o PWA está carregado
    const timer = setTimeout(checkFirstOpen, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return { shouldShowWelcome, isLoading }
}
