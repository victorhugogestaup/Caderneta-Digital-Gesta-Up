import ListaRegistros from '../../components/cadernetas/ListaRegistros'

export default function MovimentacaoListaPage() {
  return (
    <ListaRegistros
      caderneta="movimentacao"
      titulo="MOVIMENTAÇÃO — LISTA"
      rotaForm="/caderneta/movimentacao"
    />
  )
}
