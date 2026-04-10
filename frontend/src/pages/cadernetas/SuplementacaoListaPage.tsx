import ListaRegistros from '../../components/cadernetas/ListaRegistros'

export default function SuplementacaoListaPage() {
  return (
    <ListaRegistros
      caderneta="suplementacao"
      titulo="SUPLEMENTAÇÃO — LISTA"
      rotaForm="/caderneta/suplementacao"
      colunas={[
        { campo: 'tratador', label: 'Tratador' },
        { campo: 'pasto', label: 'Pasto' },
        { campo: 'produto', label: 'Produto' },
        { campo: 'gado', label: 'Gado' },
        { campo: 'leitura', label: 'Leitura' },
        { campo: 'kg', label: 'KG', formatador: (v) => v ? `${v} kg` : '—' },
      ]}
    />
  )
}
