# Guia Completo de Migrações do Supabase - ScaleFlow

> **📋 Guia Passo a Passo para Aplicar e Verificar Migrações de Banco de Dados**

Este guia fornece instruções detalhadas em português para aplicar migrações do banco de dados no Supabase e verificar se estão atualizadas.

## Índice

1. [O Que São Migrações?](#o-que-são-migrações)
2. [Pré-requisitos](#pré-requisitos)
3. [Métodos de Aplicação das Migrações](#métodos-de-aplicação-das-migrações)
4. [Como Verificar se as Migrações Estão Atualizadas](#como-verificar-se-as-migrações-estão-atualizadas)
5. [Solução de Problemas](#solução-de-problemas)
6. [Perguntas Frequentes](#perguntas-frequentes)

---

## O Que São Migrações?

Migrações são arquivos SQL que modificam o esquema do banco de dados de forma controlada e versionada. No ScaleFlow, as migrações estão localizadas em:

```
/supabase/migrations/
├── 20241205000001_initial_schema.sql      # Cria tabelas básicas
├── 20241205000002_indexes.sql             # Adiciona índices
├── 20241205000003_functions_triggers.sql  # Cria funções e triggers
├── 20241205000004_rls_policies.sql        # Implementa políticas de segurança
└── 20241208000001_add_new_roles.sql       # Adiciona novos papéis
```

**Por que usar migrações?**
- ✅ Versionamento do esquema do banco
- ✅ Reprodutibilidade entre ambientes
- ✅ Histórico de mudanças documentado
- ✅ Facilita trabalho em equipe

---

## Pré-requisitos

Antes de começar, você precisa:

### 1. Acesso ao Projeto Supabase
- URL do projeto: `https://supabase.com/dashboard/project/ttgntuaffrondfxybxmi`
- Credenciais de acesso (usuário e senha)
- Permissões de administrador do banco de dados

### 2. Ferramentas (escolha uma)
- **Dashboard Web do Supabase** (mais fácil, sem instalação)
- **Supabase CLI** (recomendado para automação)
- **Cliente PostgreSQL** (para usuários avançados)

### 3. Arquivos de Migração
- Certifique-se de ter os arquivos mais recentes do repositório
- Caminho: `/supabase/migrations/`

---

## Métodos de Aplicação das Migrações

Você pode escolher um dos três métodos abaixo, dependendo da sua preferência e ambiente.

### 🌐 Método 1: Dashboard Web do Supabase (Recomendado para Iniciantes)

**Melhor para:** Primeira vez, sem ferramentas instaladas, aplicação rápida

#### Passo a Passo:

**1. Acesse o Editor SQL**
   ```
   1. Vá para: https://supabase.com/dashboard/project/ttgntuaffrondfxybxmi
   2. Faça login com suas credenciais
   3. No menu lateral esquerdo, clique em "SQL Editor"
   4. Clique no botão "+ New query" para criar uma nova consulta
   ```

**2. Execute a Migração 1 - Schema Inicial**
   ```
   1. Abra o arquivo: supabase/migrations/20241205000001_initial_schema.sql
   2. Copie TODO o conteúdo do arquivo (Ctrl+A, Ctrl+C)
   3. Cole no Editor SQL do Supabase (Ctrl+V)
   4. Clique no botão "Run" (ou pressione Ctrl+Enter)
   5. Aguarde a mensagem: "Success. No rows returned"
   6. ✅ Confirme que não houve erros em vermelho
   ```

**3. Execute a Migração 2 - Índices**
   ```
   1. Limpe o editor (selecione tudo e delete)
   2. Abra o arquivo: supabase/migrations/20241205000002_indexes.sql
   3. Copie TODO o conteúdo
   4. Cole no Editor SQL
   5. Clique em "Run"
   6. ✅ Aguarde mensagem de sucesso
   ```

**4. Execute a Migração 3 - Funções e Triggers**
   ```
   1. Limpe o editor
   2. Abra o arquivo: supabase/migrations/20241205000003_functions_triggers.sql
   3. Copie TODO o conteúdo
   4. Cole no Editor SQL
   5. Clique em "Run"
   6. ✅ Aguarde mensagem de sucesso
   ```

**5. Execute a Migração 4 - Políticas RLS**
   ```
   1. Limpe o editor
   2. Abra o arquivo: supabase/migrations/20241205000004_rls_policies.sql
   3. Copie TODO o conteúdo
   4. Cole no Editor SQL
   5. Clique em "Run"
   6. ✅ Aguarde mensagem de sucesso
   ```

**6. Execute a Migração 5 - Novos Papéis**
   ```
   1. Limpe o editor
   2. Abra o arquivo: supabase/migrations/20241208000001_add_new_roles.sql
   3. Copie TODO o conteúdo
   4. Cole no Editor SQL
   5. Clique em "Run"
   6. ✅ Aguarde mensagem de sucesso
   ```

**⏱️ Tempo estimado:** 10-15 minutos

---

### 💻 Método 2: Supabase CLI (Recomendado para Desenvolvimento)

**Melhor para:** Automação, desenvolvimento local, CI/CD

#### Passo a Passo:

**1. Instale o Supabase CLI**
   ```bash
   # Usando npm (recomendado)
   npm install -g supabase
   
   # Ou usando Homebrew (macOS)
   brew install supabase/tap/supabase
   
   # Ou usando Scoop (Windows)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

**2. Verifique a instalação**
   ```bash
   supabase --version
   # Deve mostrar algo como: 1.x.x
   ```

**3. Navegue até o diretório do projeto**
   ```bash
   cd /caminho/para/ScaleFlow
   ```

**4. Vincule ao projeto Supabase**
   ```bash
   supabase link --project-ref ttgntuaffrondfxybxmi
   ```
   
   - Quando solicitado, insira a senha do banco de dados
   - Você pode encontrar a senha em: `Dashboard > Settings > Database > Connection string`

**5. Aplique as migrações**
   ```bash
   supabase db push
   ```
   
   Este comando irá:
   - ✅ Detectar quais migrações ainda não foram aplicadas
   - ✅ Aplicar apenas as migrações pendentes
   - ✅ Atualizar o histórico de migrações
   - ✅ Mostrar um resumo do que foi aplicado

**6. Verifique a aplicação**
   ```bash
   # Listar todas as tabelas
   supabase db query "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
   
   # Verificar status do RLS
   supabase db query "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
   ```

**⏱️ Tempo estimado:** 5-10 minutos

**💡 Dica:** Use o script de deployment fornecido:
```bash
chmod +x supabase/deploy.sh
./supabase/deploy.sh production
```

---

### 🔧 Método 3: Cliente PostgreSQL Direto

**Melhor para:** Usuários avançados, acesso direto ao banco

#### Passo a Passo:

**1. Obtenha a string de conexão**
   ```
   1. Vá para: Dashboard > Settings > Database
   2. Na seção "Connection string", escolha "Direct connection"
   3. Copie a string (exemplo):
      postgresql://postgres:[SUA-SENHA]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres
   ```

**2. Execute as migrações via psql**
   ```bash
   # Navegue até o diretório do projeto
   cd /caminho/para/ScaleFlow
   
   # Execute cada migração em ordem
   psql "postgresql://postgres:[SUA-SENHA]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
     -f supabase/migrations/20241205000001_initial_schema.sql
   
   psql "postgresql://postgres:[SUA-SENHA]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
     -f supabase/migrations/20241205000002_indexes.sql
   
   psql "postgresql://postgres:[SUA-SENHA]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
     -f supabase/migrations/20241205000003_functions_triggers.sql
   
   psql "postgresql://postgres:[SUA-SENHA]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
     -f supabase/migrations/20241205000004_rls_policies.sql
   
   psql "postgresql://postgres:[SUA-SENHA]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
     -f supabase/migrations/20241208000001_add_new_roles.sql
   ```

**3. Ou execute todas de uma vez**
   ```bash
   for migration in supabase/migrations/*.sql; do
     echo "Aplicando: $migration"
     psql "sua-string-de-conexao" -f "$migration"
   done
   ```

**⏱️ Tempo estimado:** 5-10 minutos

---

## Como Verificar se as Migrações Estão Atualizadas

Após aplicar as migrações, é crucial verificar se tudo foi aplicado corretamente.

### 📋 Checklist de Verificação Rápida

Execute estas queries no Editor SQL do Supabase para verificar:

#### ✅ 1. Verificar Tabelas Criadas

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Resultado esperado (7 tabelas):**
- ✓ companies
- ✓ preferences
- ✓ profiles
- ✓ roles
- ✓ shift_templates
- ✓ shifts
- ✓ swap_requests

#### ✅ 2. Verificar Row Level Security (RLS) Habilitado

```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Resultado esperado:** Todas as 7 tabelas devem mostrar "✅ Habilitado"

#### ✅ 3. Verificar Índices Criados

```sql
SELECT 
  COUNT(*) as total_indices,
  COUNT(DISTINCT tablename) as tabelas_com_indices
FROM pg_indexes 
WHERE schemaname = 'public';
```

**Resultado esperado:** 
- total_indices: Pelo menos 20
- tabelas_com_indices: Pelo menos 6

#### ✅ 4. Verificar Funções Criadas

```sql
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Resultado esperado (7 funções):**
- ✓ get_user_company
- ✓ get_user_role
- ✓ handle_new_user
- ✓ is_manager
- ✓ is_system_admin
- ✓ same_company
- ✓ update_updated_at_column

#### ✅ 5. Verificar Papéis (Roles) Inseridos

```sql
SELECT name, description 
FROM public.roles 
ORDER BY name;
```

**Resultado esperado (6 papéis):**
- ✓ employee
- ✓ manager
- ✓ operator
- ✓ schedule_manager
- ✓ staff
- ✓ system_admin

#### ✅ 6. Verificar Políticas RLS

```sql
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Resultado esperado:** Cada tabela deve ter entre 2-6 políticas

#### ✅ 7. Verificar Triggers

```sql
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Resultado esperado:** Triggers de atualização automática de `updated_at` em pelo menos 6 tabelas

---

### 🔍 Verificação Detalhada com Script

Use o script de teste fornecido:

```bash
cd /caminho/para/ScaleFlow
chmod +x supabase/test-migrations.sh
./supabase/test-migrations.sh
```

**O que o script verifica:**
- ✅ Existência dos arquivos de migração
- ✅ Sintaxe SQL válida
- ✅ Parênteses balanceados
- ✅ Terminadores de statement
- ✅ Tamanho dos arquivos

---

### 📊 Verificação via Supabase CLI

Se você tem o CLI instalado:

```bash
# Ver status das migrações aplicadas
supabase migration list

# Ver diferenças entre local e remoto
supabase db diff

# Verificar se há migrações pendentes
supabase db pull
```

---

### 🧪 Teste de Integridade

Execute este teste completo de integridade:

```sql
-- Teste completo de integridade
DO $$
DECLARE
  table_count INT;
  function_count INT;
  rls_enabled_count INT;
  index_count INT;
  role_count INT;
BEGIN
  -- Conta tabelas
  SELECT COUNT(*) INTO table_count FROM pg_tables WHERE schemaname = 'public';
  
  -- Conta funções
  SELECT COUNT(*) INTO function_count 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  
  -- Conta tabelas com RLS
  SELECT COUNT(*) INTO rls_enabled_count 
  FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = true;
  
  -- Conta índices
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  -- Conta papéis
  SELECT COUNT(*) INTO role_count FROM public.roles;
  
  -- Exibe resultados
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RELATÓRIO DE INTEGRIDADE DAS MIGRAÇÕES';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabelas criadas: % (esperado: 7)', table_count;
  RAISE NOTICE 'Funções criadas: % (esperado: 7)', function_count;
  RAISE NOTICE 'Tabelas com RLS: % (esperado: 7)', rls_enabled_count;
  RAISE NOTICE 'Índices criados: % (esperado: 20+)', index_count;
  RAISE NOTICE 'Papéis inseridos: % (esperado: 6)', role_count;
  RAISE NOTICE '========================================';
  
  -- Verifica se está tudo ok
  IF table_count >= 7 AND function_count >= 7 AND rls_enabled_count >= 7 
     AND index_count >= 20 AND role_count >= 6 THEN
    RAISE NOTICE '✅ TODAS AS MIGRAÇÕES APLICADAS COM SUCESSO!';
  ELSE
    RAISE NOTICE '⚠️  ALGUMAS MIGRAÇÕES PODEM ESTAR FALTANDO!';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
```

---

## Solução de Problemas

### ❌ Problema 1: "Extension uuid-ossp does not exist"

**Causa:** A extensão para geração de UUIDs não está habilitada.

**Solução:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Execute isso ANTES das migrações no Editor SQL.

---

### ❌ Problema 2: "Permission denied for schema public"

**Causa:** Usuário sem permissões adequadas.

**Solução:**
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

---

### ❌ Problema 3: "Relation already exists"

**Causa:** Migração já foi aplicada anteriormente.

**Solução:** Isso é normal! As migrações usam `IF NOT EXISTS`, então são seguras para executar múltiplas vezes. Se você quiser recomeçar do zero:

```sql
-- ⚠️ ATENÇÃO: Isso vai DELETAR TODOS OS DADOS!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Depois, execute as migrações novamente.

---

### ❌ Problema 4: "Foreign key constraint violation"

**Causa:** Migrações executadas fora de ordem.

**Solução:** Execute as migrações na ordem correta:
1. 20241205000001_initial_schema.sql
2. 20241205000002_indexes.sql
3. 20241205000003_functions_triggers.sql
4. 20241205000004_rls_policies.sql
5. 20241208000001_add_new_roles.sql

---

### ❌ Problema 5: Supabase CLI não conecta

**Causa:** Senha incorreta ou problemas de rede.

**Solução:**
1. Verifique sua senha no Dashboard > Settings > Database
2. Tente resetar a senha do banco de dados
3. Verifique sua conexão com internet
4. Use VPN se estiver em rede restrita

```bash
# Teste a conexão
supabase db ping

# Ou use o método alternativo de conexão
supabase link --project-ref ttgntuaffrondfxybxmi --password "sua-senha"
```

---

### ❌ Problema 6: RLS está bloqueando queries

**Causa:** Políticas de Row Level Security estão ativas.

**Solução:** Isso é o comportamento esperado! RLS protege os dados. Para testar:

```sql
-- Como administrador, você pode desabilitar temporariamente (NÃO RECOMENDADO EM PRODUÇÃO)
ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;

-- Ou consulte com bypass (requer permissões de administrador)
SET LOCAL role = 'postgres';
SELECT * FROM nome_da_tabela;
```

Para uso normal, faça login na aplicação para ter acesso aos dados.

---

## Perguntas Frequentes

### ❓ Posso executar as migrações múltiplas vezes?

**Sim!** Todas as migrações usam comandos como `CREATE TABLE IF NOT EXISTS` e `DROP POLICY IF EXISTS`, o que significa que são **idempotentes** - seguras para executar várias vezes sem causar erros.

---

### ❓ Como desfazer uma migração?

O Supabase não tem comando automático de rollback. Para desfazer:

**Opção 1: Restaurar backup**
1. Vá para Dashboard > Settings > Backups
2. Escolha um backup anterior
3. Restaure o banco de dados

**Opção 2: Rollback manual**
Crie um arquivo SQL de rollback com comandos reversos:
```sql
-- Exemplo de rollback da migração de papéis
DELETE FROM public.roles WHERE name IN ('operator', 'staff', 'schedule_manager');
```

---

### ❓ Como criar uma nova migração?

```bash
# Usando o CLI
supabase migration new nome_da_migracao

# Ou manualmente:
# Crie um arquivo: supabase/migrations/YYYYMMDDHHMMSS_nome_descritivo.sql
# Exemplo: 20241210120000_add_new_table.sql
```

**Estrutura recomendada:**
```sql
-- Descrição: O que essa migração faz
-- Data: YYYY-MM-DD
-- Autor: Seu Nome

-- Use IF NOT EXISTS para idempotência
CREATE TABLE IF NOT EXISTS public.nova_tabela (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilite RLS
ALTER TABLE public.nova_tabela ENABLE ROW LEVEL SECURITY;

-- Crie políticas
CREATE POLICY "policy_name" ON public.nova_tabela
  FOR SELECT
  USING (true);  -- Ajuste conforme necessidade
```

---

### ❓ Qual a diferença entre ambiente local e produção?

**Ambiente Local:**
- Use `supabase start` para rodar Supabase localmente
- Dados não afetam produção
- Ideal para testes

**Ambiente Produção:**
- Dados reais de usuários
- Sempre faça backup antes de aplicar migrações
- Use o script de deployment com confirmação

---

### ❓ Como fazer backup antes das migrações?

**Via Dashboard:**
1. Vá para Dashboard > Settings > Backups
2. Clique em "Create backup"
3. Aguarde a conclusão
4. Anote o timestamp do backup

**Via CLI:**
```bash
# Download do backup
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### ❓ As migrações afetam dados existentes?

**Não!** As migrações do ScaleFlow foram projetadas para:
- ✅ Preservar dados existentes
- ✅ Adicionar novas estruturas sem deletar
- ✅ Usar comandos seguros (IF NOT EXISTS, IF EXISTS)

**Exceção:** Se você executar o script de rollback completo (DROP SCHEMA), você perderá todos os dados.

---

### ❓ Posso aplicar apenas uma migração específica?

**Sim!** 

**Via Dashboard:** Execute apenas o arquivo SQL específico no Editor SQL

**Via CLI:** Não é possível selecionar, mas você pode:
```bash
# Aplicar manualmente uma migração específica
psql "sua-connection-string" -f supabase/migrations/20241208000001_add_new_roles.sql
```

---

### ❓ Como verificar se uma migração específica foi aplicada?

```sql
-- Verifique pela presença de objetos específicos
-- Exemplo: Verificar se a migração de novos papéis foi aplicada
SELECT EXISTS (
  SELECT 1 FROM public.roles 
  WHERE name IN ('operator', 'staff', 'schedule_manager')
) as nova_roles_aplicada;

-- Deve retornar: true
```

---

### ❓ Quanto tempo levam as migrações?

**Estimativas:**
- Dashboard Web: 10-15 minutos (manual)
- Supabase CLI: 5-10 minutos (automatizado)
- PostgreSQL direto: 5-10 minutos
- Script automatizado: 2-5 minutos

O tempo real depende de:
- Velocidade da internet
- Tamanho do banco de dados atual
- Complexidade das migrações

---

## 📚 Recursos Adicionais

### Documentação do Projeto
- [Guia de Deployment Completo](../supabase/DEPLOYMENT_GUIDE.md) - Em inglês
- [Resumo das Migrações](../supabase/MIGRATION_SUMMARY.md)
- [Referência Rápida](../supabase/QUICK_REFERENCE.md)
- [Documentação do Schema](DATABASE.md)
- [Checklist de Verificação](../supabase/VERIFICATION_CHECKLIST.md)

### Documentação Oficial
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Scripts Úteis
- `supabase/deploy.sh` - Script de deployment automatizado
- `supabase/test-migrations.sh` - Script de validação de migrações

---

## 🎯 Resumo Rápido

### Para Iniciantes (Dashboard Web):
1. Acesse o SQL Editor do Supabase
2. Execute cada arquivo .sql em ordem
3. Verifique com as queries de checklist
4. Pronto! ✅

### Para Desenvolvedores (CLI):
```bash
npm install -g supabase
supabase link --project-ref ttgntuaffrondfxybxmi
supabase db push
```

### Verificação Rápida:
```sql
-- Cole isso no SQL Editor
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tabelas,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as funcoes,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_habilitado,
  (SELECT COUNT(*) FROM public.roles) as papeis;
-- Esperado: tabelas=7, funcoes=7, rls_habilitado=7, papeis=6
```

---

## 📞 Precisa de Ajuda?

Se você encontrar problemas não documentados aqui:

1. **Verifique os logs do Supabase:** Dashboard > Logs
2. **Consulte a documentação:** Links acima
3. **Revise este guia:** Seção de Solução de Problemas
4. **Abra uma issue:** No repositório do projeto

---

**Última Atualização:** Dezembro 2024  
**Versão do Guia:** 1.0  
**Compatível com:** Supabase CLI 1.x, PostgreSQL 15+

---

## ✅ Checklist Final

Após seguir este guia, você deve ter:

- [ ] Todas as 5 migrações aplicadas com sucesso
- [ ] 7 tabelas criadas no banco de dados
- [ ] RLS habilitado em todas as tabelas
- [ ] 7 funções auxiliares criadas
- [ ] 6 papéis (roles) inseridos na tabela
- [ ] 20+ índices para performance
- [ ] Triggers de atualização automática funcionando
- [ ] Políticas de segurança RLS ativas
- [ ] Aplicação conectando ao banco sem erros
- [ ] Verificação completa executada e aprovada

**Parabéns! Suas migrações do Supabase estão atualizadas e funcionando! 🎉**
