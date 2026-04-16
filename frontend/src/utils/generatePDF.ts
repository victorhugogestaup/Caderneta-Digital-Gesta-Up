import jsPDF from 'jspdf'
import { Registro } from '../types/cadernetas'
import { CadernetaStore } from '../services/indexedDB'

// Mapeamento de campos para labels amigáveis (igual ao usado no compartilhamento de texto)
const campoLabel: Record<string, string> = {
  pasto: 'PASTO',
  numeroCria: 'NÚMERO CRIA',
  numeroMae: 'NÚMERO MÃE',
  sexo: 'SEXO',
  tipoParto: 'TIPO DE PARTO',
  raca: 'RAÇA',
  tratamento: 'TRATAMENTO',
  pesoCria: 'PESO CRIA',
  manejador: 'MANEJADOR',
  lote: 'LOTE',
  numeroLote: 'LOTE',
  pastoSaida: 'PASTO SAÍDA',
  pastoEntrada: 'PASTO ENTRADA',
  totalAnimais: 'TOTAL ANIMAIS',
  tratador: 'TRATADOR',
  produto: 'PRODUTO',
  gado: 'GADO',
  leitura: 'LEITURA',
  kg: 'KG',
  totalCabecas: 'TOTAL CABEÇAS',
  animaisTratados: 'ANIMAIS TRATADOS',
  animaisDoentes: 'ANIMAIS DOENTES',
  animalMorto: 'ANIMAL MORTO',
  loteOrigem: 'LOTE ORIGEM',
  loteDestino: 'LOTE DESTINO',
  numeroCabecas: 'NÚMERO CABEÇAS',
  pesoMedio: 'PESO MÉDIO',
  motivoMovimentacao: 'MOTIVO',
  brincoChip: 'BRINCO/CHIP',
  responsavel: 'RESPONSÁVEL',
  categoria: 'CATEGORIA',
  categoriaMae: 'CATEGORIA MÃE',
  leituraBebedouro: 'LEITURA BEBEDOURO',
}

const formatFieldValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'
  if (key === 'pesoCria' && value !== null && value !== undefined && value !== '') {
    return `${String(value)} kg`
  }
  return String(value)
}

interface GeneratePDFOptions {
  registro: Registro
  caderneta: CadernetaStore
  titulo: string
  nomeUsuario: string
  nomeFazenda: string
  logoGestapUp?: string
  logoFazenda?: string
}

export async function generatePDF(options: GeneratePDFOptions): Promise<void> {
  const { registro, caderneta, titulo, nomeUsuario, nomeFazenda, logoGestapUp, logoFazenda } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Configurações de fonte
  doc.setFont('helvetica')

  // Adicionar logos (se fornecidos)
  if (logoGestapUp || logoFazenda) {
    if (logoGestapUp) {
      try {
        doc.addImage(logoGestapUp, 'PNG', margin, yPosition, 30, 30)
      } catch (e) {
        console.error('Erro ao carregar logo GestaUp:', e)
      }
    }
    if (logoFazenda) {
      try {
        doc.addImage(logoFazenda, 'PNG', pageWidth - 50, yPosition, 30, 30)
      } catch (e) {
        console.error('Erro ao carregar logo Fazenda:', e)
      }
    }
    yPosition += 40
  }

  // Título principal
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text("GESTA'UP - CADETERNETAS DIGITAIS", pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  // Linha separadora
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Nome da fazenda
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Fazenda: ${nomeFazenda}`, margin, yPosition)
  yPosition += 8

  // Tipo de caderneta
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Registro: ${titulo}`, margin, yPosition)
  yPosition += 8

  // Usuário
  doc.text(`Usuário: ${nomeUsuario}`, margin, yPosition)
  yPosition += 8

  // Data
  doc.text(`Data: ${String(registro.data)}`, margin, yPosition)
  yPosition += 15

  // Caixa com os dados do registro
  const boxMargin = margin
  const boxWidth = pageWidth - 2 * margin
  const boxHeight = 10

  // Desenhar caixa
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(boxMargin, yPosition, boxWidth, boxHeight, 'D')

  // Filtrar campos relevantes
  const camposRelevantes = Object.entries(registro).filter(([key, value]) => {
    return (
      key !== 'id' &&
      key !== 'data' &&
      key !== 'syncStatus' &&
      key !== 'version' &&
      key !== 'lastModified' &&
      value !== null &&
      value !== undefined &&
      value !== ''
    )
  })

  // Adicionar campos dinamicamente
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  camposRelevantes.forEach(([key, value]) => {
    const label = campoLabel[key] || key.toUpperCase()
    const valorFormatado = formatFieldValue(key, value)

    // Se a caixa está cheia, criar nova página
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = margin
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(boxMargin, yPosition, boxWidth, boxHeight, 'D')
    }

    doc.text(`${label}: ${valorFormatado}`, margin + 5, yPosition + 7)
    yPosition += 8
  })

  // Ajustar altura da caixa final
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(boxMargin, margin + 55, boxWidth, yPosition - margin - 55 + 5, 'D')

  // Rodapé
  yPosition += 15
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(128, 128, 128)
  const dataGeracao = new Date().toLocaleString('pt-BR')
  doc.text(`Gerado em: ${dataGeracao}`, margin, yPosition)

  // Salvar PDF
  const nomeArquivo = `${caderneta}_${registro.id.slice(0, 8)}.pdf`
  doc.save(nomeArquivo)
}
