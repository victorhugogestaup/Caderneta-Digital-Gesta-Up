import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate'
import Button from './ui/Button'

export function PWAUpdateBanner() {
  const { showUpdateBanner, applyUpdate, dismissUpdate } = useServiceWorkerUpdate()

  if (!showUpdateBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">refresh</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                Nova versão disponível!
              </p>
              <p className="text-xs text-green-100">
                Toque para atualizar e obter as melhorias mais recentes
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={dismissUpdate}
              variant="ghost"
              size="sm"
              className="!text-white !border-white/30 hover:!bg-white/10"
            >
              Agora não
            </Button>
            <Button
              onClick={applyUpdate}
              variant="primary"
              size="sm"
              className="!bg-white !text-green-700 hover:!bg-green-50"
            >
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
