# Plano de Ação: Polling Bidirecional (Supabase → App)

## Objetivo
Implementar polling para que o app busque automaticamente novos registros do Supabase e os sincronize com o IndexedDB local.

## Contexto
Atualmente, o app só sincroniza na direção app → Supabase. Quando um registro é adicionado diretamente no Supabase (pelo backend), o app não busca esse registro automaticamente.

## Fases de Implementação

### Fase 1: Backend
**Objetivo:** Criar endpoint para buscar registros atualizados

**Tarefas:**
- [ ] Criar endpoint GET `/api/supabase/registros/:caderneta`
  - Parâmetros:
    - `fazendaId` (query string)
    - `lastSyncTimestamp` (query string, opcional)
  - Retorna registros atualizados desde a última sync
  - Filtra por `fazenda_id` e `deleted_at IS NULL`
  - Ordena por `updated_at` descendente
- [ ] Adicionar validação de parâmetros
- [ ] Tratar erros de conexão com Supabase
- [ ] Rate limiting (máximo 10 requisições por minuto por IP)

**Arquivos:**
- `backend/api/supabase.ts` (novo ou existente)
- `backend/server.ts` (adicionar rota)

---

### Fase 2: Frontend - Estrutura de Dados
**Objetivo:** Adicionar rastreamento de última sync

**Tarefas:**
- [ ] Adicionar campo `lastSyncTimestamp` no configSlice do Redux
- [ ] Atualizar timestamp após sync bem-sucedido
- [ ] Persistir timestamp no IndexedDB
- [ ] Carregar timestamp ao abrir app

**Arquivos:**
- `frontend/src/store/store.ts` (configSlice)
- `frontend/src/services/indexedDB.ts` (salvar/carregar timestamp)

---

### Fase 3: Frontend - Função de Fetch
**Objetivo:** Criar função para buscar registros do Supabase

**Tarefas:**
- [ ] Criar função `fetchRegistrosFromSupabase(caderneta, fazendaId, lastSyncTimestamp)`
  - Chama endpoint do backend
  - Valida resposta
  - Retorna array de registros
- [ ] Adicionar try-catch para tratamento de erros
- [ ] Implementar exponential backoff em caso de erro 429
- [ ] Log detalhado para debug

**Arquivos:**
- `frontend/src/services/supabaseService.ts` (nova função)

---

### Fase 4: Frontend - Merge de Dados
**Objetivo:** Implementar lógica de merge inteligente

**Tarefas:**
- [ ] Criar função `mergeRegistros(localRegistros, remoteRegistros)`
  - Deduplicação por `id`
  - Comparação de `version`:
    - Se version local > version remote: manter local
    - Se version remote > version local: usar remote
    - Se versões iguais: manter local
  - Comparação de `lastModified`:
    - Se lastModified local > lastModified remote: manter local
    - Se lastModified remote > lastModified local: usar remote
- [ ] Backup dos dados locais antes do merge
- [ ] Rollback automático em caso de erro
- [ ] Validação de esquema antes de salvar

**Arquivos:**
- `frontend/src/services/syncService.ts` (nova função)

---

### Fase 5: Frontend - Polling
**Objetivo:** Implementar polling automático

**Tarefas:**
- [ ] Criar hook `useSupabasePolling` ou integrar no `useSync`
- [ ] Configurar intervalo de polling (5 minutos)
- [ ] Verificar `navigator.onLine` antes de polling
- [ ] Verificar `countPending()` antes de polling
  - Se houver pendentes, pular polling até sync completo
- [ ] Limitar a 3 tentativas consecutivas com falha
  - Após 3 falhas, aumentar intervalo para 10 minutos
  - Reset contador após sucesso
- [ ] Paginação para evitar sobrecarga (máximo 100 registros por request)

**Arquivos:**
- `frontend/src/hooks/useSupabasePolling.ts` (novo) ou `frontend/src/hooks/useSync.ts` (integrar)

---

### Fase 6: Frontend - Integração
**Objetivo:** Integrar polling no App

**Tarefas:**
- [ ] Iniciar polling no App.tsx
- [ ] Parar polling ao sair do app
- [ ] Atualizar listas de cadernetas automaticamente após sync
- [ ] Testar com cadernetas principais (maternidade, pastagens, abastecimento)

**Arquivos:**
- `frontend/src/App.tsx`

---

### Fase 7: Testes
**Objetivo:** Validar implementação

**Tarefas:**
- [ ] Testar polling com novos registros adicionados no Supabase
- [ ] Testar conflito de versões
- [ ] Testar deduplicação
- [ ] Testar comportamento offline
- [ ] Testar rate limiting
- [ ] Testar com muitos registros (paginação)
- [ ] Testar rollback em caso de erro

---

## Estratégias de Prevenção de Erros

### 1. Conflito de Versões
- **Prevenção:** Comparar `version` e `lastModified`
  - Se version local > version Supabase: manter local
  - Se version Supabase > version local: baixar, marcar como conflito
  - Se versões iguais: manter local

### 2. Registros Duplicados
- **Prevenção:** Deduplicação por `id` único
  - Se `id` já existe no IndexedDB, ignorar ou fazer merge
  - Usar campo `sync_status` para rastrear origem

### 3. Dados Corrompidos
- **Prevenção:** Validação de esquema antes de salvar
  - Try-catch no merge de dados
  - Log de erros com detalhes

### 4. Rate Limiting
- **Prevenção:** Intervalo mínimo de 5 minutos
  - Exponential backoff em caso de erro 429
  - Cache de última resposta

### 5. Conflito Durante Sync Local Pendente
- **Prevenção:** Verificar `countPending()` antes de polling
  - Se houver pendentes, pular polling
  - Ou não baixar registros da mesma caderneta com pendentes

### 6. Perda de Dados Durante Merge
- **Prevenção:** Backup dos dados locais antes do merge
  - Rollback automático em caso de erro

### 7. Offline Durante Polling
- **Prevenção:** Verificar `navigator.onLine` antes de polling
  - Se offline, pular e tentar no próximo ciclo

### 8. Timestamp Desincronizado
- **Prevenção:** Usar timestamp do servidor
  - Validar timestamp antes de usar (não pode ser futuro)

### 9. Memória Excedida
- **Prevenção:** Paginação (buscar em lotes de 100)
  - Limite máximo de registros por polling

### 10. Loop Infinito
- **Prevenção:** Máximo de 3 tentativas consecutivas
  - Aumentar intervalo após falhas
  - Reset contador após sucesso

---

## Configurações

### Intervalo de Polling
- **Padrão:** 5 minutos
- **Após falhas:** 10 minutos
- **Mínimo:** 1 minuto (configurável via backend)

### Limite de Registros
- **Por request:** 100 registros
- **Total por polling:** 500 registros (5 requests)

### Rate Limiting
- **Backend:** 10 requisições por minuto por IP
- **Frontend:** Respeitar headers de rate limit

---

## Métricas de Sucesso

- [ ] Polling funciona sem erros por 24 horas
- [ ] Novos registros do Supabase aparecem no app em até 5 minutos
- [ ] Sem conflitos de versões não resolvidos
- [ ] Sem registros duplicados
- [ ] Performance: sync completo em menos de 2 segundos
- [ ] Uso de memória estável

---

## Rollback

Se houver problemas críticos:
1. Desabilitar polling via configuração remota
2. Remover hook do App.tsx
3. Manter sync unidirecional (app → Supabase)
