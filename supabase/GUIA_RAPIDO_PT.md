# 🚀 Guia Rápido de Migrações - ScaleFlow

> **Referência rápida em português para aplicar e verificar migrações do Supabase**

## ⚡ Início Rápido

### Opção 1: Dashboard Web (Mais Simples)

```
1. Acesse: https://supabase.com/dashboard/project/ttgntuaffrondfxybxmi
2. Clique em "SQL Editor"
3. Para cada arquivo em supabase/migrations/:
   - Copie o conteúdo completo
   - Cole no editor
   - Clique "Run"
   - Aguarde "Success"
```

### Opção 2: Linha de Comando (Mais Rápido)

```bash
# Instalar CLI
npm install -g supabase

# Vincular projeto
supabase link --project-ref ttgntuaffrondfxybxmi

# Aplicar migrações
supabase db push

# Ou usar script automatizado
./supabase/deploy.sh production
```

---

## 📋 Ordem das Migrações

Execute nesta ordem:

1. ✅ `20241205000001_initial_schema.sql` - Tabelas básicas
2. ✅ `20241205000002_indexes.sql` - Índices de performance
3. ✅ `20241205000003_functions_triggers.sql` - Funções e triggers
4. ✅ `20241205000004_rls_policies.sql` - Políticas de segurança
5. ✅ `20241208000001_add_new_roles.sql` - Novos papéis

---

## ✔️ Verificação Rápida

Cole isso no SQL Editor para verificar tudo:

```sql
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tabelas,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') as funcoes,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_habilitado,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indices,
  (SELECT COUNT(*) FROM public.roles) as papeis;
```

**Resultado esperado:**
- tabelas: `7`
- funcoes: `7`
- rls_habilitado: `7`
- indices: `20+`
- papeis: `6`

---

## 🔧 Script de Verificação

Execute para verificar automaticamente:

```bash
./supabase/verificar-migracoes.sh
```

---

## ❌ Problemas Comuns

### Erro: "Extension uuid-ossp does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erro: "Permission denied"
```sql
GRANT ALL ON SCHEMA public TO postgres;
```

### Erro: "Relation already exists"
✅ Normal! Migrações são seguras para executar múltiplas vezes.

### CLI não conecta
```bash
# Verifique senha no Dashboard > Settings > Database
supabase link --project-ref ttgntuaffrondfxybxmi --password "sua-senha"
```

---

## 📖 Documentação Completa

Para instruções detalhadas, consulte:

- 🇧🇷 **[Guia Completo em Português](../docs/SUPABASE_MIGRATIONS_GUIDE.md)** ⭐
- 🇺🇸 [English Deployment Guide](DEPLOYMENT_GUIDE.md)
- 📊 [Migration Summary](MIGRATION_SUMMARY.md)
- ✅ [Verification Checklist](VERIFICATION_CHECKLIST.md)

---

## 🆘 Precisa de Ajuda?

1. Consulte o [Guia Completo](../docs/SUPABASE_MIGRATIONS_GUIDE.md)
2. Verifique [Solução de Problemas](../docs/SUPABASE_MIGRATIONS_GUIDE.md#solução-de-problemas)
3. Abra uma issue no GitHub

---

**Versão:** 1.0  
**Última Atualização:** Dezembro 2024
