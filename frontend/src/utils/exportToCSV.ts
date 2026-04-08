import { Registro } from '../types/cadernetas'

export function exportToCSV(
  registros: Registro[],
  filename: string,
  colunas?: { campo: string; label: string }[]
): void {
  if (registros.length === 0) {
    alert('Nenhum registro para exportar')
    return
  }

  // Se colunas não especificadas, usa todas as keys do primeiro registro
  const headers = colunas
    ? colunas.map((c) => c.label)
    : Object.keys(registros[0]).filter((k) => k !== 'id' && !k.startsWith('_'))

  const keys = colunas
    ? colunas.map((c) => c.campo)
    : Object.keys(registros[0]).filter((k) => k !== 'id' && !k.startsWith('_'))

  // Prepara dados
  const rows = registros.map((registro) =>
    keys.map((key) => {
      const val = registro[key]
      // Trata arrays (categorias, procedimentos)
      if (Array.isArray(val)) return `"${val.join(', ')}"`
      // Trata strings com vírgulas ou quebras de linha
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
  )

  // Monta CSV
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  // Download com BOM UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(registros: Registro[], filename: string): void {
  if (registros.length === 0) {
    alert('Nenhum registro para exportar')
    return
  }

  const jsonContent = JSON.stringify(registros, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function copyToClipboard(registros: Registro[]): void {
  if (registros.length === 0) {
    alert('Nenhum registro para copiar')
    return
  }

  const texto = registros
    .map((r) => {
      const data = String(r.data || '-')
      const id = String(r.id).slice(0, 8)
      const campos = Object.entries(r)
        .filter(([k]) => k !== 'id' && k !== 'lastModified' && k !== 'version' && k !== 'syncStatus')
        .map(([, v]) => String(v))
        .join(' | ')
      return `[${data}] ${id}: ${campos}`
    })
    .join('\n')

  navigator.clipboard
    .writeText(texto)
    .then(() => alert('Registros copiados para a área de transferência!'))
    .catch(() => alert('Erro ao copiar. Tente exportar para CSV.'))
}
