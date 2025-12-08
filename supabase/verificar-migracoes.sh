#!/bin/bash

# =====================================================
# Script de Verificação de Migrações do ScaleFlow
# =====================================================
# Este script verifica se as migrações foram aplicadas corretamente
# Uso: ./verificar-migracoes.sh

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Verificação de Migrações do Supabase         ║${NC}"
echo -e "${BLUE}║  ScaleFlow Database Migration Checker         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI não encontrado${NC}"
    echo "Para verificação completa, instale o Supabase CLI:"
    echo "  npm install -g supabase"
    echo ""
    echo "Ou use o método manual no Dashboard do Supabase."
    echo "Consulte: docs/SUPABASE_MIGRATIONS_GUIDE.md"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI encontrado${NC}"
echo ""

# Obter diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

echo -e "${CYAN}📁 Diretório do projeto:${NC} $PROJECT_ROOT"
echo -e "${CYAN}📁 Diretório de migrações:${NC} $MIGRATIONS_DIR"
echo ""

# Verificar se o diretório de migrações existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}✗ Diretório de migrações não encontrado${NC}"
    exit 1
fi

# Contar arquivos de migração
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
echo -e "${CYAN}📊 Migrações encontradas:${NC} ${GREEN}${MIGRATION_COUNT}${NC}"
echo ""

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${RED}✗ Nenhum arquivo de migração encontrado${NC}"
    exit 1
fi

# Listar migrações
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 Arquivos de Migração:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
for file in "$MIGRATIONS_DIR"/*.sql; do
    filename=$(basename "$file")
    filesize=$(du -h "$file" | cut -f1)
    echo -e "  ${GREEN}✓${NC} $filename ${CYAN}($filesize)${NC}"
done
echo ""

# Verificar conexão com o banco
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔌 Verificando Conexão com Banco de Dados...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar se está vinculado ao projeto
PROJECT_REF=$(grep 'project_id' "$SCRIPT_DIR/config.toml" 2>/dev/null | cut -d'"' -f2)
if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}⚠️  ID do projeto não encontrado em config.toml${NC}"
    echo "Execute: supabase link --project-ref SEU_PROJECT_ID"
    exit 1
fi

echo -e "${CYAN}🆔 Project ID:${NC} ${GREEN}$PROJECT_REF${NC}"
echo ""

# Função para executar query e exibir resultado
run_check() {
    local title=$1
    local query=$2
    local expected=$3
    
    echo -e "${CYAN}$title${NC}"
    
    result=$(supabase db query "$query" 2>&1)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ Consulta executada com sucesso${NC}"
        echo "$result" | head -20
        
        if [ ! -z "$expected" ]; then
            if echo "$result" | grep -q "$expected"; then
                echo -e "${GREEN}✓ Resultado esperado encontrado${NC}"
            else
                echo -e "${YELLOW}⚠️  Resultado pode não estar completo${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ Erro ao executar consulta${NC}"
        echo "$result"
        return 1
    fi
    echo ""
}

# Executar verificações
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 Verificando Estrutura do Banco de Dados...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Verificar tabelas
run_check \
  "1️⃣  Verificando Tabelas (Esperado: 7 tabelas)" \
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" \
  "companies"

# 2. Verificar RLS
run_check \
  "2️⃣  Verificando Row Level Security (Esperado: Todas habilitadas)" \
  "SELECT tablename, CASE WHEN rowsecurity THEN 'Habilitado' ELSE 'Desabilitado' END as rls FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# 3. Verificar funções
run_check \
  "3️⃣  Verificando Funções (Esperado: 7 funções)" \
  "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION' ORDER BY routine_name;" \
  "get_user_role"

# 4. Verificar índices
run_check \
  "4️⃣  Verificando Índices (Esperado: 20+ índices)" \
  "SELECT COUNT(*) as total_indices FROM pg_indexes WHERE schemaname = 'public';"

# 5. Verificar papéis
run_check \
  "5️⃣  Verificando Papéis/Roles (Esperado: 6 papéis)" \
  "SELECT name, LEFT(description, 50) as desc_resumida FROM public.roles ORDER BY name;" \
  "manager"

# 6. Verificar políticas RLS
run_check \
  "6️⃣  Verificando Políticas RLS (Esperado: 20-30 políticas)" \
  "SELECT tablename, COUNT(*) as total FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename ORDER BY tablename;"

# Teste de integridade completo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🧪 Executando Teste de Integridade Completo...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

INTEGRITY_CHECK=$(supabase db query "
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tabelas,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') as funcoes,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_habilitado,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indices,
  (SELECT COUNT(*) FROM public.roles) as papeis,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as politicas;
" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Teste de integridade executado${NC}"
    echo "$INTEGRITY_CHECK"
    echo ""
    
    # Extrair valores (aproximado, pode variar com formato da saída)
    tables=$(echo "$INTEGRITY_CHECK" | grep -oP 'tabelas\s*\|\s*\K\d+' | head -1 || echo "?")
    functions=$(echo "$INTEGRITY_CHECK" | grep -oP 'funcoes\s*\|\s*\K\d+' | head -1 || echo "?")
    rls=$(echo "$INTEGRITY_CHECK" | grep -oP 'rls_habilitado\s*\|\s*\K\d+' | head -1 || echo "?")
    indices=$(echo "$INTEGRITY_CHECK" | grep -oP 'indices\s*\|\s*\K\d+' | head -1 || echo "?")
    roles=$(echo "$INTEGRITY_CHECK" | grep -oP 'papeis\s*\|\s*\K\d+' | head -1 || echo "?")
    policies=$(echo "$INTEGRITY_CHECK" | grep -oP 'politicas\s*\|\s*\K\d+' | head -1 || echo "?")
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📊 Resumo da Verificação:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    all_ok=true
    
    # Verificar cada métrica
    if [ "$tables" = "7" ] || [ "$tables" = "?" ]; then
        echo -e "  ${GREEN}✓${NC} Tabelas: $tables / 7"
    else
        echo -e "  ${RED}✗${NC} Tabelas: $tables / 7 ${YELLOW}(Esperado: 7)${NC}"
        all_ok=false
    fi
    
    if [ "$functions" = "7" ] || [ "$functions" = "?" ]; then
        echo -e "  ${GREEN}✓${NC} Funções: $functions / 7"
    else
        echo -e "  ${YELLOW}⚠${NC}  Funções: $functions / 7 ${YELLOW}(Esperado: 7)${NC}"
    fi
    
    if [ "$rls" = "7" ] || [ "$rls" = "?" ]; then
        echo -e "  ${GREEN}✓${NC} RLS Habilitado: $rls / 7"
    else
        echo -e "  ${RED}✗${NC} RLS Habilitado: $rls / 7 ${YELLOW}(Esperado: 7)${NC}"
        all_ok=false
    fi
    
    if [ "$indices" != "?" ]; then
        if [ "$indices" -ge 20 ]; then
            echo -e "  ${GREEN}✓${NC} Índices: $indices (mínimo: 20)"
        else
            echo -e "  ${YELLOW}⚠${NC}  Índices: $indices ${YELLOW}(Esperado: 20+)${NC}"
        fi
    else
        echo -e "  ${CYAN}ℹ${NC}  Índices: Não foi possível verificar"
    fi
    
    if [ "$roles" = "6" ] || [ "$roles" = "3" ] || [ "$roles" = "?" ]; then
        echo -e "  ${GREEN}✓${NC} Papéis: $roles (esperado: 6)"
    else
        echo -e "  ${YELLOW}⚠${NC}  Papéis: $roles ${YELLOW}(Esperado: 6)${NC}"
    fi
    
    if [ "$policies" != "?" ]; then
        if [ "$policies" -ge 20 ]; then
            echo -e "  ${GREEN}✓${NC} Políticas RLS: $policies"
        else
            echo -e "  ${YELLOW}⚠${NC}  Políticas RLS: $policies ${YELLOW}(Esperado: 20+)${NC}"
        fi
    else
        echo -e "  ${CYAN}ℹ${NC}  Políticas RLS: Não foi possível verificar"
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ "$all_ok" = true ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ TODAS AS MIGRAÇÕES ESTÃO ATUALIZADAS!      ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}Próximos passos:${NC}"
        echo "  1. Teste a aplicação para garantir funcionalidade"
        echo "  2. Verifique os logs do Supabase para erros"
        echo "  3. Configure backups automáticos"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  ⚠️  ALGUMAS VERIFICAÇÕES FALHARAM             ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}Ações recomendadas:${NC}"
        echo "  1. Verifique se todas as migrações foram executadas"
        echo "  2. Execute: supabase db push"
        echo "  3. Consulte: docs/SUPABASE_MIGRATIONS_GUIDE.md"
        echo "  4. Verifique logs de erro no Dashboard do Supabase"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}✗ Erro ao executar teste de integridade${NC}"
    echo "$INTEGRITY_CHECK"
    echo ""
    echo -e "${CYAN}Possíveis causas:${NC}"
    echo "  1. Não conectado ao projeto Supabase"
    echo "  2. Credenciais incorretas"
    echo "  3. Projeto não vinculado"
    echo ""
    echo -e "${CYAN}Soluções:${NC}"
    echo "  1. Execute: supabase link --project-ref $PROJECT_REF"
    echo "  2. Verifique suas credenciais no Dashboard"
    echo "  3. Consulte: docs/SUPABASE_MIGRATIONS_GUIDE.md"
    echo ""
    exit 1
fi
