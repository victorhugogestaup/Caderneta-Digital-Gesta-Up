import { google } from 'googleapis'
import { logger } from '../utils/logger'
import path from 'path'
import fs from 'fs'

const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || './config/google-credentials.json'

export function getAuth() {
  // Em produção (Vercel), usa a environment variable
  const credentialsEnv = process.env.GOOGLE_CREDENTIALS_FILE
  
  if (credentialsEnv) {
    // Produção: ler da environment variable
    const credentials = JSON.parse(credentialsEnv)
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  }

  // Desenvolvimento: ler do arquivo local
  const credentialsPath = path.resolve(CREDENTIALS_PATH)

  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Arquivo de credenciais não encontrado: ' + credentialsPath + ' e GOOGLE_CREDENTIALS_FILE não definido')
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export function extractSpreadsheetId(url: string): string {
  // Remove parâmetros de query e fragmentos antes de extrair o ID
  const cleanUrl = url.split('?')[0].split('#')[0]
  const match = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) throw new Error('Link da planilha inválido')
  return match[1]
}

/**
 * Extrai link por prefixo de uma célula que pode conter múltiplos links
 * Exemplo: "Caderneta: https://... Insumo: https://... checklist: https://..."
 * @param cellValue Valor da célula
 * @param prefix Prefixo a buscar (ex: "Caderneta", "Insumo", "Cadastro", "checklist")
 * @returns Link extraído ou null se não encontrado
 */
export function extractLinkByPrefix(cellValue: string, prefix: string): string | null {
  if (!cellValue) return null

  // Retrocompatibilidade: se não tiver prefixo, retorna o valor inteiro
  if (!cellValue.includes(':')) {
    return cellValue.trim()
  }

  // Buscar por prefixo específico
  const regex = new RegExp(`${prefix}:\\s*(https?://[^\\s]+)`, 'i')
  const match = cellValue.match(regex)

  if (match) {
    return match[1].trim()
  }

  return null
}

/**
 * Extrai link por posição da coluna C
 * @param columnCValues Valores da coluna C (array de arrays)
 * @param position Posição do link (1 = Caderneta/C2, 2 = Checklist/C3, 3 = Cadastro/C4)
 * @returns Link extraído ou null se não encontrado
 */
export function extractLinkByPosition(columnCValues: (string | number | null)[][], position: number): string | null {
  if (!columnCValues || columnCValues.length === 0) return null
  
  // Posição 1 = C2 (índice 0), Posição 2 = C3 (índice 1), Posição 3 = C4 (índice 2)
  const rowIndex = position - 1
  
  if (rowIndex >= columnCValues.length) return null
  
  const row = columnCValues[rowIndex]
  if (!row || row.length === 0) return null
  
  const cellValue = String(row[0]).trim()
  if (!cellValue || cellValue === '') return null
  
  return cellValue
}

export async function appendRow(
  spreadsheetUrl: string,
  sheetName: string,
  values: (string | number | null)[]
): Promise<number> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  // Forçar datas como texto para evitar conversão automática do Google Sheets
  const processedValues = values.map(v => {
    if (typeof v === 'string' && v.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return `'${v}` // Adicionar apóstrofo para forçar como texto
    }
    return v
  })

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [processedValues] },
  })

  const updatedRange = response.data.updates?.updatedRange || ''
  const rowMatch = updatedRange.match(/:.*?(\d+)$/)
  const rowNumber = rowMatch ? parseInt(rowMatch[1]) : -1

  logger.info(`Linha adicionada na aba ${sheetName}, linha ${rowNumber}`)
  return rowNumber
}

export async function updateRow(
  spreadsheetUrl: string,
  sheetName: string,
  rowNumber: number,
  values: (string | number | null)[]
): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })

  logger.info(`Linha ${rowNumber} atualizada na aba ${sheetName}`)
}

export async function getRows(
  spreadsheetUrl: string,
  sheetName: string
): Promise<(string | number | null)[][]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:Z`,
  })

  return (response.data.values || []) as (string | number | null)[][]
}

export async function getNextId(spreadsheetUrl: string, sheetName: string): Promise<number> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:A`,
  })

  const values = response.data.values || []
  let maxId = 0

  for (const row of values) {
    if (row[0]) {
      const id = parseInt(String(row[0]))
      if (!isNaN(id) && id > maxId) {
        maxId = id
      }
    }
  }

  return maxId + 1
}

export async function validateConnection(spreadsheetUrl: string): Promise<boolean> {
  try {
    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

    await sheets.spreadsheets.get({ spreadsheetId })
    return true
  } catch (error) {
    logger.error('Erro ao validar conexão com planilha: ' + error)
    return false
  }
}

export async function listSheets(spreadsheetUrl: string): Promise<string[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  const response = await sheets.spreadsheets.get({ spreadsheetId })
  const sheetNames = response.data.sheets?.map((sheet) => sheet.properties?.title).filter((title): title is string => title !== undefined) || []

  logger.info(`Abas listadas: ${sheetNames.join(', ')}`)
  return sheetNames
}

export async function validateFarm(spreadsheetUrl: string, farmId: string, linkPosition: number = 1): Promise<{ success: boolean; farmName?: string; farmSheetUrl?: string }> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  // Listar todas as abas
  const response = await sheets.spreadsheets.get({ spreadsheetId })
  const sheetNames = response.data.sheets?.map((sheet) => sheet.properties?.title).filter((title): title is string => title !== undefined) || []

  // Buscar o ID na célula A2 de cada aba
  for (const sheetName of sheetNames) {
    try {
      const cellResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A2:C4`,
      })

      const values = cellResponse.data.values
      if (values && values.length > 0 && values[0].length > 0) {
        const idInCell = String(values[0][0]).trim()
        const nomeInCell = values[0].length > 1 ? String(values[0][1]).trim() : ''

        // Match exato (case-insensitive)
        if (idInCell.toLowerCase() === farmId.toLowerCase()) {
          // Extrair coluna C (C2, C3, C4)
          const columnCValues: (string | number | null)[][] = []
          for (let i = 0; i < values.length && i < 3; i++) {
            if (values[i].length > 2) {
              columnCValues.push([values[i][2]])
            } else {
              columnCValues.push([''])
            }
          }

          // Extrair link por posição
          const extractedUrl = extractLinkByPosition(columnCValues, linkPosition)

          logger.info(`Fazenda encontrada: ${sheetName}, ID: ${idInCell}, Nome: ${nomeInCell}, Link (posição ${linkPosition}): ${extractedUrl}`)
          return { success: true, farmName: nomeInCell || sheetName, farmSheetUrl: extractedUrl || undefined }
        }
      }
    } catch (error) {
      logger.error(`Erro ao buscar na aba ${sheetName}: ${error}`)
      // Continua para a próxima aba
    }
  }

  logger.warn(`ID ${farmId} não encontrado em nenhuma aba`)
  return { success: false }
}

export async function getSubtiposDaFazenda(
  spreadsheetUrl: string,
  farmId: string,
  tipo: string
): Promise<string[]> {
  // Primeiro, encontrar a fazenda e extrair o link da planilha de cadastro (posição 3)
  const farmResult = await validateFarm(spreadsheetUrl, farmId, 3)
  
  if (!farmResult.success || !farmResult.farmSheetUrl) {
    logger.warn(`Não foi possível encontrar a planilha de cadastro para a fazenda ${farmId}`)
    return []
  }

  const cadastroSheetUrl = farmResult.farmSheetUrl
  logger.info(`Planilha de cadastro encontrada: ${cadastroSheetUrl}`)

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const cadastroSheetId = extractSpreadsheetId(cadastroSheetUrl)

  // Mapear tipo para coluna (0-indexed) na planilha de cadastro
  // Estrutura: PASTO(0), LOTE(1), MINERAL(2), PROTEINADO(3), RACAO(4), INSUMOS(5), DIETAS(6), FORNECEDORES(7), FUNCIONÁRIOS(8)
  const colunasPorTipo: Record<string, number> = {
    'Pasto': 0,
    'Lote': 1,
    'Mineral': 2,
    'Proteinado': 3,
    'Ração': 4,
    'Insumos': 5,
    'Dietas': 6,
    'Fornecedores': 7,
    'Funcionários': 8,
  }

  const colunaIndex = colunasPorTipo[tipo]
  if (colunaIndex === undefined) {
    logger.warn(`Tipo '${tipo}' não mapeado para coluna na planilha de cadastro`)
    return []
  }

  // Converter índice de coluna para letra (0=A, 1=B, 2=C, etc.)
  const colunaLetra = String.fromCharCode(65 + colunaIndex)

  try {
    // Buscar a coluna específica a partir da linha 2 (pular cabeçalho na linha 1)
    const range = `A2:Z1000`
    const cellResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: cadastroSheetId,
      range,
    })

    const values = cellResponse.data.values
    if (!values || values.length === 0) {
      logger.warn(`Nenhum dado encontrado na planilha de cadastro`)
      return []
    }

    // Ler todos os valores não vazios da coluna específica
    const subtipos: string[] = []
    for (let i = 0; i < values.length; i++) {
      const row = values[i]
      if (colunaIndex < row.length) {
        const valor = String(row[colunaIndex]).trim()
        if (valor && valor !== '') {
          subtipos.push(valor)
        }
      }
    }

    if (subtipos.length > 0) {
      logger.info(`Subtipos encontrados para ${tipo} na planilha de cadastro: ${subtipos.join(', ')}`)
      return subtipos
    }

    logger.warn(`Nenhum subtipo encontrado para tipo ${tipo} na planilha de cadastro`)
    return []
  } catch (error) {
    logger.error(`Erro ao buscar subtipos na planilha de cadastro: ${error}`)
    return []
  }
}
