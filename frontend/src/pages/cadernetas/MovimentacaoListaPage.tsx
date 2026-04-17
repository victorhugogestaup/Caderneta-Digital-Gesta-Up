import ListaRegistros from '../../components/cadernetas/ListaRegistros'

export default function MovimentacaoListaPage() {
  return (
    <ListaRegistros
      caderneta="movimentacao"
      titulo="MOVIMENTAÇÃO"
      rotaForm="/caderneta/movimentacao"
    />
  )
}
