import { useEffect } from 'react'
import { X } from 'lucide-react'

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
    <div 
      className="fixed inset-0 bg-black z-50"
      onClick={onClose}
    >
      {/* Header com botão de fechar */}
      <div 
        className="sticky top-0 bg-black/80 p-4 flex justify-end z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="text-white hover:bg-gray-700 rounded-full p-2 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Imagens em scroll vertical */}
      <div 
        className="w-full h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 items-center p-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`POP Maternidade - Página ${index + 1}`}
              className="max-w-full h-auto"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
