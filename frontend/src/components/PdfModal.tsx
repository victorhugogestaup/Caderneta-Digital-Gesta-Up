import { useEffect } from 'react'
import { X } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

interface PdfModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
}

export default function PdfModal({ isOpen, onClose, images }: PdfModalProps) {
  // Prevenir scroll quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={images.map((src) => ({ src }))}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        scrollToZoom: true,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
    />
  )
}
