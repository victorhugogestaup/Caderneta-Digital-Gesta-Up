import { google } from 'googleapis'
import { logger } from '../utils/logger'
import path from 'path'
import fs from 'fs'

const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || './config/google-credentials.json'

function getAuth() {
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

export async function appendRow(
  spreadsheetUrl: string,
  sheetName: string,
  values: (string | number | null)[]
): Promise<number> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
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

export async function validateFarm(spreadsheetUrl: string, farmId: string): Promise<{ success: boolean; farmName?: string; farmSheetUrl?: string }> {
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
        range: `${sheetName}!A2:C2`,
      })

      const values = cellResponse.data.values
      if (values && values.length > 0 && values[0].length > 0) {
        const idInCell = String(values[0][0]).trim()
        const nomeInCell = values[0].length > 1 ? String(values[0][1]).trim() : ''
        const sheetUrlInCell = values[0].length > 2 ? String(values[0][2]).trim() : ''

        // Match exato (case-insensitive)
        if (idInCell.toLowerCase() === farmId.toLowerCase()) {
          logger.info(`Fazenda encontrada: ${sheetName}, ID: ${idInCell}, Nome: ${nomeInCell}, Link: ${sheetUrlInCell}`)
          return { success: true, farmName: nomeInCell || sheetName, farmSheetUrl: sheetUrlInCell || undefined }
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
