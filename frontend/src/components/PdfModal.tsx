import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface PdfModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
}

export default function PdfModal({ isOpen, onClose, pdfUrl }: PdfModalProps) {
  const [error, setError] = useState(false)

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

  // Resetar erro quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setError(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header com botão de fechar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <span className="text-white font-semibold">POP Maternidade</span>
        <button
          onClick={onClose}
          className="text-white hover:bg-gray-700 rounded-full p-2 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 w-full h-full">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <p className="text-lg mb-4">Erro ao carregar PDF</p>
            <button
              onClick={onClose}
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold"
            >
              Fechar
            </button>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="POP Maternidade"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  )
}
