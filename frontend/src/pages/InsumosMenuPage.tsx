import { useNavigate } from 'react-router-dom'
import { LOGO_URL } from '../utils/constants'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

export default function InsumosMenuPage() {
  const navigate = useNavigate()
  const { fazenda } = useSelector((state: RootState) => state.config)

  const menuItems = [
    {
      id: 'cadastro',
      label: 'VISUALIZAR CADASTROS',
      emoji: '📋',
      description: 'Visualizar insumos, dietas, fornecedores e funcionários',
      path: '/estoque-insumos/cadastro',
      color: '#3b82f6',
    },
    {
      id: 'entrada',
      label: 'ENTRADA DE INSUMOS',
      emoji: '📥',
      description: 'Registrar entrada de insumos no estoque',
      path: '/estoque-insumos/entrada',
      color: '#10b981',
    },
    {
      id: 'producao',
      label: 'PRODUÇÃO FÁBRICA',
      emoji: '🏭',
      description: 'Registrar saída de insumos para produção',
      path: '/estoque-insumos/producao',
      color: '#f59e0b',
    },
    {
      id: 'estoque',
      label: 'ESTOQUE',
      emoji: '📦',
      description: 'Visualizar estoque atual',
      path: '/estoque-insumos/estoque',
      color: '#8b5cf6',
      disponivel: false,
    },
  ]

  const hexToRgba = (hex: string, alpha: number = 0.25): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#1a3a2a] text-white py-6 border-b-4 border-yellow-400 relative">
        <div className="flex flex-col items-center gap-3 px-4">
          <div className="flex items-center justify-between w-full">
            <img src={LOGO_URL} alt="Logo GestaUp" className="w-16 h-auto object-contain rounded-[22px] ml-7" />
            {fazenda && (
              <img src={LOGO_URL} alt="Logo Fazenda" className="h-[58px] w-auto object-contain rounded-[22px] mr-7" />
            )}
          </div>
          {fazenda && (
            <h1 className="text-2xl font-bold text-white">{fazenda.toUpperCase()}</h1>
          )}
          <div className="flex items-center gap-3 w-full relative">
            <button
              onClick={() => navigate('/')}
              className="text-yellow-400 font-bold text-sm min-h-[40px] px-3 absolute left-0"
            >
              VOLTAR
            </button>
            <p className="text-white text-base font-semibold flex-1 text-center">CHECKLISTS DIGITAIS</p>
          </div>
        </div>
      </header>

      {/* Menu de Insumos - 3 botões grandes */}
      <main className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.disponivel !== false && navigate(item.path)}
              disabled={item.disponivel === false}
              style={{ backgroundColor: hexToRgba(item.color) }}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 transition-all rounded-2xl
                ${item.disponivel === false
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
                }`}
            >
              {item.disponivel === false && (
                <span className="absolute top-2 right-2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  EM BREVE
                </span>
              )}
              <span className="text-5xl">{item.emoji}</span>
              <span className="text-base font-bold text-center leading-tight text-gray-900">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
