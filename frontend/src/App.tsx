import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Configuracoes from './pages/Configuracoes'
import MaternidadePage from './pages/cadernetas/MaternidadePage'
import MaternidadeListaPage from './pages/cadernetas/MaternidadeListaPage'
import PastagensPage from './pages/cadernetas/PastagensPage'
import PastagensListaPage from './pages/cadernetas/PastagensListaPage'
import RodeioPage from './pages/cadernetas/RodeioPage'
import RodeioListaPage from './pages/cadernetas/RodeioListaPage'
import SuplementacaoPage from './pages/cadernetas/SuplementacaoPage'
import SuplementacaoListaPage from './pages/cadernetas/SuplementacaoListaPage'
import BebedourosPage from './pages/cadernetas/BebedourosPage'
import BebedourosListaPage from './pages/cadernetas/BebedourosListaPage'
import MovimentacaoPage from './pages/cadernetas/MovimentacaoPage'
import MovimentacaoListaPage from './pages/cadernetas/MovimentacaoListaPage'
import SyncStatusBar from './components/SyncStatusBar'
import ConflictModal from './components/ConflictModal'
import { useSync } from './hooks/useSync'
import { useConflicts } from './hooks/useConflicts'
import { verificarBackupAutomatico } from './services/backupService'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'

function AppInner() {
  const { runSync } = useSync()
  const { currentConflict, loadConflicts, handleConflictResolved } = useConflicts()
  const syncStatus = useSelector((state: RootState) => state.sync.status)

  useEffect(() => {
    if (syncStatus === 'conflict') {
      loadConflicts()
    }
  }, [syncStatus, loadConflicts])

  // Backup automático a cada 24 horas
  useEffect(() => {
    verificarBackupAutomatico()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <SyncStatusBar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home onSyncRequest={runSync} />} />
          <Route path="/configuracoes" element={<Configuracoes />} />

          {/* Maternidade */}
          <Route path="/caderneta/maternidade" element={<MaternidadePage />} />
          <Route path="/caderneta/maternidade/lista" element={<MaternidadeListaPage />} />

          {/* Troca de Pastos */}
          <Route path="/caderneta/pastagens" element={<PastagensPage />} />
          <Route path="/caderneta/pastagens/lista" element={<PastagensListaPage />} />

          {/* Rodeio Gado */}
          <Route path="/caderneta/rodeio" element={<RodeioPage />} />
          <Route path="/caderneta/rodeio/lista" element={<RodeioListaPage />} />

          {/* Suplementação */}
          <Route path="/caderneta/suplementacao" element={<SuplementacaoPage />} />
          <Route path="/caderneta/suplementacao/lista" element={<SuplementacaoListaPage />} />

          {/* Bebedouros */}
          <Route path="/caderneta/bebedouros" element={<BebedourosPage />} />
          <Route path="/caderneta/bebedouros/lista" element={<BebedourosListaPage />} />

          {/* Movimentação */}
          <Route path="/caderneta/movimentacao" element={<MovimentacaoPage />} />
          <Route path="/caderneta/movimentacao/lista" element={<MovimentacaoListaPage />} />

          {/* Fallback */}
          <Route path="/caderneta/:id" element={<Navigate to="/" replace />} />
          <Route path="/caderneta/:id/lista" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {currentConflict && (
        <ConflictModal
          conflict={currentConflict}
          onResolved={handleConflictResolved}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  )
}

export default App
