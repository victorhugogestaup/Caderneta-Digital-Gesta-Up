import { BACKEND_URL } from '../utils/constants'

export interface CadastroData {
  pastos: string[]
  lotes: string[]
  minerais: string[]
  proteinados: string[]
  racoes: string[]
  insumos: string[]
  dietas: string[]
  fornecedores: string[]
  funcionarios: string[]
  destinos: string[]
}

// Cache simples em memória
let cache: CadastroData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Carrega dados da planilha de cadastro
 * @param cadastroSheetUrl URL da planilha de cadastro
 * @param forceCache Se true, ignora o cache e força recarregamento
 * @returns Dados de cadastro
 */
export async function loadCadastroData(
  cadastroSheetUrl: string,
  forceCache: boolean = false
): Promise<CadastroData> {
  // Verificar cache
  if (!forceCache && cache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Usando cache de cadastroData')
    return cache
  }

  if (!cadastroSheetUrl) {
    throw new Error('cadastroSheetUrl é obrigatório')
  }

  try {
    // Usar endpoint existente /api/insumos/cadastro
    const readRes = await fetch(`${BACKEND_URL}/api/insumos/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insumosSheetUrl: cadastroSheetUrl }),
    })

    const readData = await readRes.json()
    if (!readData.success || !readData.rows) {
      throw new Error('Não foi possível ler os dados de cadastro')
    }

    // Processar dados
    const rows = readData.rows as (string | number | null)[][]
    const cadastroData: CadastroData = {
      pastos: [],
      lotes: [],
      minerais: [],
      proteinados: [],
      racoes: [],
      insumos: [],
      dietas: [],
      fornecedores: [],
      funcionarios: [],
      destinos: [],
    }

    // Estrutura esperada: coluna 0 = PASTO, coluna 1 = LOTE, coluna 2 = MINERAL, coluna 3 = PROTEINADO,
    // coluna 4 = RACAO, coluna 5 = INSUMOS, coluna 6 = DIETAS, coluna 7 = FORNECEDORES, coluna 8 = FUNCIONÁRIOS, coluna 9 = DESTINOS
    for (const row of rows) {
      if (row[0]) cadastroData.pastos.push(String(row[0]))
      if (row[1]) cadastroData.lotes.push(String(row[1]))
      if (row[2]) cadastroData.minerais.push(String(row[2]))
      if (row[3]) cadastroData.proteinados.push(String(row[3]))
      if (row[4]) cadastroData.racoes.push(String(row[4]))
      if (row[5]) cadastroData.insumos.push(String(row[5]))
      if (row[6]) cadastroData.dietas.push(String(row[6]))
      if (row[7]) cadastroData.fornecedores.push(String(row[7]))
      if (row[8]) cadastroData.funcionarios.push(String(row[8]))
      if (row[9]) cadastroData.destinos.push(String(row[9]))
    }

    // Atualizar cache
    cache = cadastroData
    cacheTimestamp = Date.now()

    return cadastroData
  } catch (error) {
    console.error('Erro ao carregar dados de cadastro:', error)
    throw new Error('Erro ao carregar dados de cadastro')
  }
}

/**
 * Invalida o cache de cadastroData
 * Deve ser chamado após salvar novos cadastros
 */
export function invalidateCadastroCache(): void {
  cache = null
  cacheTimestamp = 0
  console.log('Cache de cadastroData invalidado')
}
