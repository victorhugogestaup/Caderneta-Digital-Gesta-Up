import ListaRegistros from '../../components/cadernetas/ListaRegistros'

export default function MovimentacaoListaPage() {
  return (
    <ListaRegistros
      caderneta="movimentacao"
      titulo="🚚 MOVIMENTAÇÃO — LISTA"
      rotaForm="/caderneta/movimentacao"
      colunas={[
        { campo: 'loteOrigem', label: 'Origem' },
        { campo: 'loteDestino', label: 'Destino' },
        { campo: 'numeroCabecas', label: 'Cab.', formatador: (v) => `${v ?? 0}` },
        { campo: 'pesoMedio', label: 'Peso', formatador: (v) => v ? `${v} kg` : '—' },
        { campo: 'motivoMovimentacao', label: 'Motivo' },
        { campo: 'brincoChip', label: 'ID' },
      ]}
    />
  )
}
