import { useState, useMemo } from 'react'
import { Registro } from '../types/cadernetas'

interface FiltrosState {
  busca: string
  dataInicio: string
  dataFim: string
  ordenacao: 'data_desc' | 'data_asc'
}

const makeInitialFiltros = (): FiltrosState => ({
  busca: '',
  dataInicio: '',
  dataFim: '',
  ordenacao: 'data_desc',
})

const parseDataHora = (dataStr: string): number => {
  const partes = dataStr.split(' ')
  const [dia, mes, ano] = partes[0].split('/')
  let hora = 0
  let minuto = 0

  if (partes.length > 1) {
    const [h, m] = partes[1].split(':')
    hora = parseInt(h, 10)
    minuto = parseInt(m, 10)
  }

  return new Date(`${ano}-${mes}-${dia}T${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`).getTime()
}

export function useSearchFiltros(registros: Registro[]) {
  const [filtros, setFiltros] = useState<FiltrosState>(makeInitialFiltros)

  const registrosFiltrados = useMemo(() => {
    let resultado = [...registros]

    // Filtro de busca textual
    if (filtros.busca.trim()) {
      const termo = filtros.busca.toLowerCase().trim()
      resultado = resultado.filter((r) =>
        Object.values(r).some((val) =>
          String(val).toLowerCase().includes(termo)
        )
      )
    }

    // Filtro de período
    const isValidDateFormat = (date: string): boolean => /^\d{2}\/\d{2}\/\d{4}(\s\d{2}:\d{2})?$/.test(date)

    if (filtros.dataInicio && isValidDateFormat(filtros.dataInicio)) {
      const [dia, mes, ano] = filtros.dataInicio.split('/').slice(0, 3)
      const inicio = new Date(`${ano}-${mes}-${dia}T00:00:00`).getTime()
      resultado = resultado.filter((r) => {
        if (!isValidDateFormat(String(r.data))) return true
        const dataRegistro = parseDataHora(String(r.data))
        return dataRegistro >= inicio
      })
    }

    if (filtros.dataFim && isValidDateFormat(filtros.dataFim)) {
      const [dia, mes, ano] = filtros.dataFim.split('/').slice(0, 3)
      const fim = new Date(`${ano}-${mes}-${dia}T23:59:59`).getTime()
      resultado = resultado.filter((r) => {
        if (!isValidDateFormat(String(r.data))) return true
        const dataRegistro = parseDataHora(String(r.data))
        return dataRegistro <= fim
      })
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (filtros.ordenacao) {
        case 'data_desc': {
          const dateA = parseDataHora(String(a.data))
          const dateB = parseDataHora(String(b.data))
          return dateB - dateA
        }
        case 'data_asc': {
          const dateA = parseDataHora(String(a.data))
          const dateB = parseDataHora(String(b.data))
          return dateA - dateB
        }
        default:
          return 0
      }
    })

    return resultado
  }, [registros, filtros])

  const setBusca = (val: string) => setFiltros((p) => ({ ...p, busca: val }))
  const setDataInicio = (val: string) => setFiltros((p) => ({ ...p, dataInicio: val }))
  const setDataFim = (val: string) => setFiltros((p) => ({ ...p, dataFim: val }))
  const setOrdenacao = (val: FiltrosState['ordenacao']) => setFiltros((p) => ({ ...p, ordenacao: val }))
  const limparFiltros = () => setFiltros(makeInitialFiltros())

  const setPeriodoRapido = (periodo: 'hoje' | '7dias' | '30dias' | 'todos') => {
    const hoje = new Date()
    const dia = hoje.getDate().toString().padStart(2, '0')
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0')
    const ano = hoje.getFullYear()

    let dataInicio = ''
    let dataFim = ''

    if (periodo === 'hoje') {
      dataInicio = `${dia}/${mes}/${ano}`
      dataFim = `${dia}/${mes}/${ano}`
    } else if (periodo === '7dias') {
      const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
      const diaInicio = seteDiasAtras.getDate().toString().padStart(2, '0')
      const mesInicio = (seteDiasAtras.getMonth() + 1).toString().padStart(2, '0')
      const anoInicio = seteDiasAtras.getFullYear()
      dataInicio = `${diaInicio}/${mesInicio}/${anoInicio}`
      dataFim = `${dia}/${mes}/${ano}`
    } else if (periodo === '30dias') {
      const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
      const diaInicio = trintaDiasAtras.getDate().toString().padStart(2, '0')
      const mesInicio = (trintaDiasAtras.getMonth() + 1).toString().padStart(2, '0')
      const anoInicio = trintaDiasAtras.getFullYear()
      dataInicio = `${diaInicio}/${mesInicio}/${anoInicio}`
      dataFim = `${dia}/${mes}/${ano}`
    }

    setFiltros((p) => ({ ...p, dataInicio, dataFim }))
  }

  const temFiltrosAtivos = filtros.busca || filtros.dataInicio || filtros.dataFim || filtros.ordenacao !== 'data_desc'

  return {
    filtros,
    registrosFiltrados,
    setBusca,
    setDataInicio,
    setDataFim,
    setOrdenacao,
    limparFiltros,
    setPeriodoRapido,
    temFiltrosAtivos,
    totalOriginal: registros.length,
    totalFiltrado: registrosFiltrados.length,
  }
}
