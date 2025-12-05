# ScaleFlow Backend Setup Guide

Este guia completo te ajudará a configurar o backend do ScaleFlow passo a passo.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Configuração Detalhada](#configuração-detalhada)
- [Implantação](#implantação)
- [Verificação](#verificação)
- [Solução de Problemas](#solução-de-problemas)

## 🎯 Visão Geral

O ScaleFlow usa **Supabase** como backend, que fornece:

- ✅ **PostgreSQL Database** - Banco de dados relacional robusto
- ✅ **Authentication** - Sistema de autenticação completo
- ✅ **Row Level Security (RLS)** - Segurança a nível de linha
- ✅ **Real-time subscriptions** - Atualizações em tempo real
- ✅ **RESTful API** - API automática baseada no schema
- ✅ **Storage** - Armazenamento de arquivos (opcional)

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- [x] **Node.js** versão 18 ou superior
- [x] **npm** ou **pnpm** package manager
- [x] **Conta Supabase** (gratuita em [supabase.com](https://supabase.com))
- [x] **Projeto Supabase criado** (ID: `ttgntuaffrondfxybxmi`)

## 🚀 Instalação Rápida

Execute o script automatizado de configuração:

```bash
# 1. Clone o repositório (se ainda não fez)
git clone https://github.com/Rafaelraas/ScaleFlow.git
cd ScaleFlow

# 2. Execute o script de setup
bash scripts/setup-backend.sh
```

O script irá:
- ✓ Verificar todos os pré-requisitos
- ✓ Instalar o Supabase CLI localmente
- ✓ Criar arquivos `.env` se não existirem
- ✓ Validar migrações do banco de dados
- ✓ Fornecer próximos passos

## 🔧 Configuração Detalhada

### Passo 1: Instalar Dependências

```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

#### 2.1 Configuração do Frontend (.env na raiz)

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://ttgntuaffrondfxybxmi.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

**Onde encontrar essas credenciais:**
1. Acesse [Supabase Dashboard](https://app.supabase.com/project/ttgntuaffrondfxybxmi)
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

#### 2.2 Configuração do Backend (supabase/.env)

Crie ou edite o arquivo `supabase/.env`:

```env
SUPABASE_PROJECT_ID=ttgntuaffrondfxybxmi
SUPABASE_DB_PASSWORD=sua_senha_do_banco
SUPABASE_URL=https://ttgntuaffrondfxybxmi.supabase.co
SUPABASE_ANON_KEY=seu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
```

**Onde encontrar a senha do banco:**
1. Supabase Dashboard → **Settings** → **Database**
2. Na seção "Database password"
3. Se esqueceu, você pode resetar a senha

### Passo 3: Instalar Supabase CLI

O script de setup já faz isso, mas se precisar instalar manualmente:

```bash
# Criar diretório bin se não existir
mkdir -p bin

# Baixar Supabase CLI (Linux/macOS)
cd bin
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
chmod +x supabase
cd ..

# Verificar instalação
./bin/supabase --version
```

### Passo 4: Linkar ao Projeto Supabase

```bash
# Usando o CLI local
./bin/supabase link --project-ref ttgntuaffrondfxybxmi

# Ou se instalado globalmente
supabase link --project-ref ttgntuaffrondfxybxmi
```

Você será solicitado a inserir a senha do banco de dados.

### Passo 5: Revisar Migrações

As migrações estão em `supabase/migrations/` e incluem:

1. **20241205000001_initial_schema.sql** - Schema inicial (tabelas, relações)
2. **20241205000002_indexes.sql** - Índices de performance
3. **20241205000003_functions_triggers.sql** - Funções e triggers
4. **20241205000004_rls_policies.sql** - Políticas de segurança RLS

Para validar as migrações:

```bash
cd supabase
bash test-migrations.sh
```

## 🚀 Implantação

### Opção 1: Deploy via Supabase CLI (Recomendado)

```bash
# Deploy de todas as migrações
./bin/supabase db push
```

### Opção 2: Deploy via Script Automatizado

```bash
cd supabase
bash deploy.sh production
```

Este script irá:
- Confirmar que você quer fazer deploy em produção
- Linkar ao projeto
- Executar todas as migrações
- Verificar o deployment

### Opção 3: Deploy Manual via Dashboard

1. Acesse [SQL Editor](https://app.supabase.com/project/ttgntuaffrondfxybxmi/sql)
2. Para cada arquivo em `supabase/migrations/` (na ordem):
   - Abra o arquivo
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em "Run" (ou Ctrl/Cmd + Enter)
   - Aguarde "Success"

## ✅ Verificação

Depois do deployment, verifique se tudo está funcionando:

### 1. Verificar Tabelas

No SQL Editor, execute:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Esperado:** 7 tabelas (companies, preferences, profiles, roles, shift_templates, shifts, swap_requests)

### 2. Verificar RLS

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Esperado:** Todas as tabelas com `rowsecurity = true`

### 3. Verificar Roles Padrão

```sql
SELECT name, description 
FROM public.roles 
ORDER BY name;
```

**Esperado:** 3 roles (employee, manager, system_admin)

### 4. Testar Conexão da Aplicação

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Abra http://localhost:5173 e tente:
- Criar uma conta
- Fazer login
- Criar uma empresa (como manager)

## 🔍 Solução de Problemas

### Problema: "Supabase CLI não encontrado"

**Solução:**
```bash
bash scripts/setup-backend.sh
```

### Problema: "Missing environment variables"

**Solução:**
1. Verifique se `.env` existe na raiz
2. Verifique se as variáveis estão corretas
3. Reinicie o servidor de desenvolvimento

### Problema: "Permission denied" ao executar scripts

**Solução:**
```bash
chmod +x scripts/setup-backend.sh
chmod +x supabase/deploy.sh
chmod +x supabase/test-migrations.sh
```

### Problema: "Migration failed"

**Solução:**
1. Verifique se as migrações estão sendo executadas na ordem correta
2. Verifique se a extensão uuid-ossp está habilitada
3. Veja os logs detalhados no Supabase Dashboard → Logs

### Problema: "RLS policies blocking queries"

**Solução:**
- Certifique-se de estar autenticado
- Verifique se seu usuário tem o role correto
- Veja a documentação em `docs/DATABASE.md`

## 📚 Recursos Adicionais

### Documentação do Projeto

- [README.md](./README.md) - Visão geral do projeto
- [QUICK_START.md](./QUICK_START.md) - Guia rápido de 5 minutos
- [supabase/DEPLOYMENT_GUIDE.md](./supabase/DEPLOYMENT_GUIDE.md) - Guia detalhado de deployment
- [supabase/README.md](./supabase/README.md) - Informações sobre migrações
- [docs/DATABASE.md](./docs/DATABASE.md) - Schema completo do banco
- [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) - Configuração de ambiente

### Documentação Externa

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎉 Próximos Passos

Depois de configurar o backend:

1. ✅ **Desenvolver Features** - O backend está pronto!
2. ✅ **Adicionar Dados de Teste** - Crie empresas, usuários e turnos para testar
3. ✅ **Configurar Real-time** - Supabase suporta subscriptions em tempo real
4. ✅ **Monitorar Performance** - Use o dashboard para ver métricas
5. ✅ **Configurar Backup** - Configure backups automáticos no Supabase

## 💡 Dicas

- Use **ambientes separados** para dev/staging/prod
- **Nunca commite** arquivos `.env`
- **Faça backup** antes de rodar migrações em produção
- **Teste localmente** com `supabase start` para desenvolvimento
- **Monitore logs** no Supabase Dashboard

## 🤝 Suporte

Se precisar de ajuda:

1. Revise a [documentação do projeto](./docs/INDEX.md)
2. Verifique os [issues no GitHub](https://github.com/Rafaelraas/ScaleFlow/issues)
3. Consulte a [documentação do Supabase](https://supabase.com/docs)

---

**🎯 Backend configurado com sucesso? Comece a desenvolver!**

```bash
npm run dev
```
