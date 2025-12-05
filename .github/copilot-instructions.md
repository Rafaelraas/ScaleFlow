# GitHub Copilot Instructions for ScaleFlow

These instructions are for AI coding agents working in this repo.

## Big picture
- This is a React 18 + Vite + TypeScript SPA for a SaaS shift scheduling platform.
- Routing and access control are centralized in `src/App.tsx` with `react-router-dom` and `ProtectedRoute`.
- Auth/session and role logic live in `src/providers/SessionContextProvider.tsx`, backed by Supabase (`src/integrations/supabase/client.ts`).
- Layout is shared via `src/components/layout/Layout.tsx` (wraps `Navbar` + `Sidebar` + page content).
- UI is built with Tailwind CSS and shadcn/ui in `src/components/ui/**`.

## Auth, roles e navegação protegida
- Sempre use o `SessionContextProvider` (`useSession`) para obter `session`, `userProfile` e `userRole` ao invés de chamar Supabase direto.
- Use `ProtectedRoute` (`src/components/ProtectedRoute.tsx`) para novas rotas protegidas; configure:
  - `allowedRoles`: ex. `['manager']`, `['employee']`, `['system_admin']`.
  - `requiresCompany`: `true` (padrão) para gerentes/funcionários, `false` para fluxos sem empresa (ex: criar empresa, admin system).
- Novas páginas protegidas devem ser registradas em `src/App.tsx`, envolvendo o componente em `<Layout>` dentro de um bloco `Route` com `ProtectedRoute` apropriado.

## Integração Supabase
- Use sempre o cliente único de Supabase em `src/integrations/supabase/client.ts`.
- Operações sensíveis a perfil/empresa devem respeitar RLS: assuma que seleções filtram pelo usuário logado e `company_id`.
- Para ler perfil/role, siga o padrão de `fetchUserProfileAndRole` em `SessionContextProvider` (tabela `profiles` + join em `roles`).

## Páginas, componentes e padrões
- Páginas vivem em `src/pages/**` e normalmente:
  - São funções React com TypeScript, sem estado global direto.
  - Usam `<Layout>` para manter cabeçalho + sidebar.
  - Se consomem dados remotos, use TanStack Query (`@tanstack/react-query`) com um `QueryClient` já provido em `App`.
- Componentes reutilizáveis ficam em `src/components/**`:
  - Layout compartilhado em `components/layout/**`.
  - Componentes de UI genéricos em `components/ui/**` (padrão shadcn).

## Estado, formulários e UX
- Estado de sessão e redireciono pós-login são tratados em `SessionContextProvider`; evite lógica duplicada de navegação baseada em role nas páginas.
- Para formulários, siga os exemplos existentes (React Hook Form + Zod) nos componentes de formulário em `src/components/*Form.tsx`.
- Para feedback ao usuário, utilize os helpers de toast em `src/utils/toast.ts` (`showSuccess`, `showError`, `showLoading`, `dismissToast`) em vez de chamar `sonner` diretamente.
- Use `useIsMobile` (`src/hooks/use-mobile.tsx`) para ajustes de layout responsivo ao invés de acessar `window` diretamente.

## Testes e padrões de qualidade
- Testes usam Vitest + Testing Library; veja exemplos em `src/components/*test.tsx`, `src/hooks/use-mobile.test.ts` e `src/lib/utils.test.ts`.
- Ao criar novos componentes ou hooks, adicione testes próximos ao arquivo (`*.test.tsx`/`*.test.ts`) seguindo esses exemplos.
- Rode testes com `npm run test` e lint com `npm run lint`; para debugging de testes, existe `npm run test:ui`.

## Build, desenvolvimento e deploy
- Dev server: `npm run dev` (Vite), porta padrão 5173.
- Build: `npm run build` (produção) ou `npm run build:dev` (modo desenvolvimento).
- Preview local do build: `npm run preview`.
- Deploy principal via Vercel (`vercel.json`) e workflows em `.github/workflows/deploy.yml`.

## Estilo e convenções
- Priorize componentes funcionais com TypeScript, tipando props explicitamente.
- Prefira classes utilitárias Tailwind para estilo; em UI base, reutilize componentes de `components/ui`.
- Não crie novos contextos globais sem necessidade; tente primeiro resolver com estado local ou TanStack Query.
- Ao adicionar novas rotas ou recursos, atualize o `README.md` se houver mudança relevante em páginas, papéis ou fluxos.
