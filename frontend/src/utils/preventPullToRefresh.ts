// Prevenir pull-to-refresh em PWAs instalados

export function preventPullToRefresh() {
  // Só aplicar se for PWA instalado
  if (!window.matchMedia('(display-mode: standalone)').matches && 
      !window.matchMedia('(display-mode: minimal-ui)').matches) {
    return
  }

  let touchStartY = 0
  let isScrolling = false

  const handleTouchStart = (e: TouchEvent) => {
    // Se estiver no topo da página
    if (window.scrollY === 0) {
      touchStartY = e.touches[0].clientY
      isScrolling = false
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    // Se não estiver no topo, não previne
    if (window.scrollY > 0) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY

    // Se estiver puxando para baixo no topo
    if (deltaY > 0 && !isScrolling) {
      // Prevenir o comportamento padrão do pull-to-refresh
      e.preventDefault()
      return false
    }
  }

  const handleTouchEnd = () => {
    isScrolling = false
  }

  // Adicionar listeners
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)

  // Cleanup function
  return () => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
}

// Alternativa: CSS para desabilitar overscroll
export function addPullToRefreshCSS() {
  const style = document.createElement('style')
  style.textContent = `
    /* Prevenir pull-to-refresh em PWAs */
    @media (display-mode: standalone), (display-mode: minimal-ui) {
      html, body {
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
      }
    }
  `
  document.head.appendChild(style)
}
