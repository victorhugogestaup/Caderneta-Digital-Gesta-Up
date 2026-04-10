import { useEffect } from 'react'
import { Check } from 'lucide-react'

export default function WelcomePage() {
  // Marcar que o usuário já viu a tela de boas-vindas
  useEffect(() => {
    localStorage.setItem('welcome-seen', 'true')
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="w-32 h-32 bg-yellow-400 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl">
          <img 
            src="/Caderneta-Digital-Gesta-Up/logo-gestaup-app-cadernetadigital.png" 
            alt="Logo Gesta'Up" 
            className="w-24 h-24 rounded-2xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.className = 'text-6xl text-black'
              fallback.textContent = 'AG'
              e.currentTarget.parentElement?.appendChild(fallback)
            }}
          />
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-center mb-4">
          Gesta'Up Cadernetas Digitais
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-gray-600 text-center mb-12">
          Gestão rural na palma da mão
        </p>

        {/* Descrição */}
        <div className="space-y-4 mb-12 max-w-md">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">
              Cadernetas digitais para controle completo do seu rebanho
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">
              Sincronização automática com Google Sheets
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">
              Funciona offline, sincroniza quando voltar à internet
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-gray-400 text-sm">
          Versão 1.0.0
        </p>
      </div>
    </div>
  )
}
