# Plano de Unificação de Cadastros

## Objetivo
Unificar todos os dados de cadastros (pasto, lote, mineral, proteinado, racao, insumos, dietas, fornecedores, funcionarios) em uma única planilha por fazenda, acessada via link com prefixo "Cadastro:" na base de dados.

## Contexto Atual
- Cada fazenda tem sua própria planilha de cadastro (insumos)
- Checklists e cadernetas buscam dados de diferentes fontes
- Dados duplicados e manutenção complexa

## Contexto Futuro
- Uma única planilha de cadastro por fazenda com todas as listas suspensas
- URL da planilha de cadastro na base de dados com prefixo "Cadastro:"
- Todas as páginas consultam a mesma fonte de dados
- Página única "Cadastros" para gerenciar todos os itens

## Estrutura da Planilha de Cadastro
Colunas (ordem):
1. PASTO
2. LOTE
3. MINERAL
4. PROTEINADO
5. RACAO
6. INSUMOS
7. DIETAS
8. FORNECEDORES
9. FUNCIONÁRIOS

## Fases de Implementação

### Fase 1: Modificar configSlice e Configuracoes.tsx
**Objetivo:** Ler o link "Cadastro:" da base de dados e salvar no config

**Tarefas:**
1. Adicionar campo `cadastroSheetUrl` ao configSlice para armazenar URL da planilha de cadastro
2. Modificar `validarFazendaNaBase` em Configuracoes.tsx para aceitar parâmetro `prefix`
3. Modificar `handleSalvar` para validar com prefixo 'Cadastro' e salvar URL no config
4. Testar extração do link

**Arquivos:**
- `frontend/src/store/slices/configSlice.ts`
- `frontend/src/pages/Configuracoes.tsx`

**Entregáveis:**
- Campo `cadastroSheetUrl` no configSlice
- Extração de link "Cadastro:" via backend
- URL salva no config para uso global

---

### Fase 2: Criar serviço de cadastro
**Objetivo:** Criar serviço reutilizável para buscar dados da planilha de cadastro

**Tarefas:**
1. Criar arquivo `frontend/src/services/cadastroData.ts`
2. Implementar função `loadCadastroData()` que:
   - Recebe `cadastroSheetUrl` como parâmetro (do configSlice)
   - Chama endpoint `/api/insumos/cadastro` existente (reutiliza funcionalidade de leitura de cadastro)
   - Processa todas as colunas: PASTO, LOTE, MINERAL, PROTEINADO, RACAO, INSUMOS, DIETAS, FORNECEDORES, FUNCIONÁRIOS
   - Retorna objeto com todos os arrays
3. Adicionar cache para evitar chamadas repetidas (5 minutos)
4. Adicionar função `invalidateCadastroCache()` para invalidar cache após salvar novos cadastros
5. Adicionar tratamento de erros

**Arquivos:**
- `frontend/src/services/cadastroData.ts` (novo)

**Interface:**
```typescript
interface CadastroData {
  pastos: string[]
  lotes: string[]
  minerais: string[]
  proteinados: string[]
  racoes: string[]
  insumos: string[]
  dietas: string[]
  fornecedores: string[]
  funcionarios: string[]
}

export async function loadCadastroData(): Promise<CadastroData>
```

**Entregáveis:**
- Serviço de cadastro funcionando
- Cache implementado
- Tratamento de erros

---

### Fase 3: Atualizar CadastroPage.tsx
**Objetivo:** Usar o novo serviço para visualizar cadastros

**Tarefas:**
1. Remover lógica inline de `loadCadastroData`
2. Importar e usar serviço `loadCadastroData` do cadastroData.ts
3. Usar `cadastroSheetUrl` do configSlice em vez de validar com prefixo 'Insumo'
4. Atualizar interface para mostrar todos os 9 tipos de cadastro

**Nota:** A funcionalidade de cadastrar novos itens não está incluída nesta fase. O CadastroPage atual é apenas para visualização.

**Arquivos:**
- `frontend/src/pages/estoque-insumos/CadastroPage.tsx`

**Entregáveis:**
- CadastroPage usando serviço unificado
- Interface para visualizar todos os 9 tipos

---

### Fase 4: Atualizar checklists (EntradaPage, ProducaoPage)
**Objetivo:** Buscar dados da planilha de cadastro unificada

**Tarefas:**
1. **EntradaPage.tsx:**
   - Remover lógica inline de validação com prefixo 'Insumo'
   - Importar e usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Atualizar para usar: insumos, fornecedores, funcionarios
   - Remover referência à planilha de insumos específica

2. **ProducaoPage.tsx:**
   - Remover lógica inline de validação com prefixo 'Insumo'
   - Importar e usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Atualizar para usar: insumos, dietas
   - Remover referência à planilha de insumos específica

**Arquivos:**
- `frontend/src/pages/estoque-insumos/EntradaPage.tsx`
- `frontend/src/pages/estoque-insumos/ProducaoPage.tsx`

**Entregáveis:**
- Checklists usando serviço unificado
- Removida dependência da planilha de insumos específica

---

### Fase 5: Atualizar cadernetas com listas suspensas
**Objetivo:** Buscar dados da planilha de cadastro unificada em todas as cadernetas

**Tarefas:**
1. **SuplementacaoPage.tsx:**
   - Atualizar para usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Usar: pastos, lotes, minerais, proteinados, racoes
   - Remover chamada ao endpoint `/api/suplementacao/pastos-lotes`

2. **PastagensPage.tsx:**
   - Atualizar para usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Usar: pastos, lotes
   - Remover chamada ao endpoint `/api/suplementacao/pastos-lotes`

3. **BebedourosPage.tsx:**
   - Atualizar para usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Usar: pastos, lotes
   - Remover chamada ao endpoint `/api/suplementacao/pastos-lotes`

4. **MovimentacaoPage.tsx:**
   - Atualizar para usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Usar: lotes
   - Remover chamada ao endpoint `/api/suplementacao/pastos-lotes`

5. **RodeioPage.tsx:**
   - Atualizar para usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Usar: pastos, lotes
   - Remover chamada ao endpoint `/api/suplementacao/pastos-lotes`

6. **MaternidadePage.tsx:**
   - Atualizar para usar serviço `loadCadastroData` com `cadastroSheetUrl` do configSlice
   - Usar: pastos, lotes
   - Remover chamada ao endpoint `/api/suplementacao/pastos-lotes`

**Arquivos:**
- `frontend/src/pages/cadernetas/SuplementacaoPage.tsx`
- `frontend/src/pages/cadernetas/PastagensPage.tsx`
- `frontend/src/pages/cadernetas/BebedourosPage.tsx`
- `frontend/src/pages/cadernetas/MovimentacaoPage.tsx`
- `frontend/src/pages/cadernetas/RodeioPage.tsx`
- `frontend/src/pages/cadernetas/MaternidadePage.tsx`

**Entregáveis:**
- Todas as cadernetas usando serviço unificado
- Removidas chamadas ao endpoint `/api/suplementacao/pastos-lotes`

---

### Fase 6: Limpeza de código e endpoints
**Objetivo:** Remover código obsoleto e endpoints não utilizados

**Tarefas:**
1. Remover endpoint `/api/suplementacao/pastos-lotes` do backend (após Fase 5) ✅
2. Remover função `getPastosELotesDaFazenda` do googleSheetsService ✅
3. Manter endpoint `/api/suplementacao/subtipos` (ainda usado em SuplementacaoPage)
4. Manter função `getSubtiposDaFazenda` (ainda usada pelo endpoint subtipos)
5. Manter código de validação de planilha de insumos (ainda necessário para salvar dados de entrada/produção)

**Nota:** NÃO remover endpoint `/api/insumos/cadastro` pois é usado pela Fase 2

**Arquivos:**
- `backend/src/controllers/suplementacaoController.ts` ✅
- `backend/src/services/googleSheetsService.ts` ✅

**Entregáveis:**
- Endpoint `/api/suplementacao/pastos-lotes` removido ✅
- Função `getPastosELotesDaFazenda` removida ✅

---

### Fase 7: Testes
**Objetivo:** Testar todas as funcionalidades

**Tarefas:**
1. Testar CadastroPage: visualização de todos os 9 tipos
2. Testar EntradaPage: listas suspensas carregando corretamente (insumos, fornecedores, funcionarios)
3. Testar ProducaoPage: listas suspensas carregando corretamente (insumos, dietas)
4. Testar SuplementacaoPage: pastos, lotes, minerais, proteinados, racoes carregando
5. Testar PastagensPage: pastos e lotes carregando
6. Testar BebedourosPage: pastos e lotes carregando
7. Testar MovimentacaoPage: lotes carregando
8. Testar RodeioPage: pastos e lotes carregando
9. Testar MaternidadePage: pastos e lotes carregando
10. Testar cache do serviço de cadastro
11. Testar tratamento de erros
12. Testar extração de link "Cadastro:" na configuração

**Entregáveis:**
- Todos os testes passando
- Relatório de testes

---

## Ordem de Execução
1. Fase 1: Modificar configSlice e Configuracoes.tsx ✅
2. Fase 2: Criar serviço de cadastro ✅
3. Fase 3: Atualizar CadastroPage.tsx (visualização) ✅
4. Fase 4: Atualizar checklists (EntradaPage, ProducaoPage) ✅
5. Fase 5: Atualizar cadernetas com listas suspensas ✅
6. Fase 6: Limpeza de código e endpoints ✅
7. Fase 7: Testes

## Riscos e Mitigações

### Risco 1: Link "Cadastro:" não existe na base de dados
**Mitigação:** Adicionar validação e fallback para comportamento anterior

### Risco 2: Estrutura da planilha de cadastro incorreta
**Mitigação:** Adicionar validação de colunas antes de processar

### Risco 3: Cache pode causar dados desatualizados
**Mitigação:** Implementar invalidação de cache ao salvar novos cadastros

### Risco 4: Muitas páginas para atualizar
**Mitigação:** Implementar fase por fase e testar cada uma antes de continuar

## Notas
- Preservar funcionalidades existentes durante a transição
- Manter compatibilidade com planilhas antigas durante transição
- Testar em ambiente de desenvolvimento antes de produção
- Documentar mudanças para equipe
