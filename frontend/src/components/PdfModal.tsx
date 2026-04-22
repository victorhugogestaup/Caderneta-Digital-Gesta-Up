import { useEffect } from 'react'
import { X } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

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
      className="fixed inset-0 bg-black z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Header com botão de fechar */}
      <div
        className="absolute top-0 right-0 p-4 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="text-white hover:bg-gray-700 rounded-full p-3 transition-all duration-200 bg-black/50 hover:scale-110"
          aria-label="Fechar"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Imagens com zoom e pan */}
      <div
        className="w-full h-full overflow-y-auto scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4 items-center p-4">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center animate-in zoom-in duration-300" style={{ animationDelay: `${index * 100}ms` }}>
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                wheel={{ step: 0.1 }}
                doubleClick={{ step: 0.8 }}
              >
                <TransformComponent>
                  <img
                    src={image}
                    alt={`POP Maternidade - Página ${index + 1}`}
                    className="max-w-full h-auto"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
