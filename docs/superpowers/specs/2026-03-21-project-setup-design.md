# ProdLab — Setup do Projeto

> Spec de setup: React + Vite + Tailwind + shadcn/ui + Supabase

---

## Contexto

O ProdLab é uma plataforma educacional de PCP (Planejamento e Controle da Produção) para alunos de Engenharia de Produção da Unimax/Unieduk. O sistema funciona como um MRPII didático guiado — não simula um ERP, mas torna visível o raciocínio de PCP em cadeia.

Este documento especifica o setup técnico inicial do projeto (scaffold, auth, estrutura). O módulo de previsão de demanda será implementado na etapa seguinte.

## Decisões

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Framework | React + Vite + TypeScript + SWC | SPA didático, sem necessidade de SSR |
| Estilo | Tailwind CSS + shadcn/ui | Setup via CLI, componentes acessíveis e customizáveis |
| Estado | Zustand | Leve, sem boilerplate |
| Backend | Supabase Cloud | Auth, Postgres, Edge Functions — tudo gerenciado |
| Auth | Google OAuth via Supabase | Login institucional por domínio de email |
| Roteamento | react-router-dom | Padrão para SPAs React |
| Estrutura | Monorepo simples (tudo na raiz) | Projeto único, sem necessidade de separação |
| Deploy | Não definido ainda | Foco em dev local por enquanto |

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│          React + Vite + TypeScript               │
│          Tailwind CSS + shadcn/ui                │
│                                                  │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Pages/    │  │ Components│  │ Store        │  │
│  │ Routes    │  │ (shadcn)  │  │ (Zustand)    │  │
│  └─────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        └──────────────┴───────────────┘          │
│                       │                          │
│              Supabase Client JS                  │
└───────────────────────┬─────────────────────────┘
                        │ HTTPS
┌───────────────────────┴─────────────────────────┐
│               Supabase Cloud                     │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Auth     │  │ Database │  │ Edge Functions │  │
│  │ (Google  │  │ (Postgres│  │ (futuro:      │  │
│  │  OAuth)  │  │  + RLS)  │  │  cálculos)    │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────┘
```

## Estrutura de pastas

```
src/
├── app/                  # App root, providers, router
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx     # Supabase auth listener → Zustand
├── pages/                # Páginas por rota
│   ├── Login.tsx
│   ├── Dashboard.tsx     # Shell do aluno (área plugável pra módulos)
│   ├── AdminDashboard.tsx # Shell do professor (vazio, prova roteamento)
│   └── Unauthorized.tsx  # Acesso negado (domínio não institucional)
├── components/           # Componentes reutilizáveis
│   ├── ui/               # shadcn/ui (gerado pelo CLI)
│   ├── ProtectedRoute.tsx # Guard de autenticação
│   └── RoleRoute.tsx     # Guard de role (student/teacher)
├── lib/                  # Utilitários
│   ├── supabase.ts       # Client Supabase
│   └── utils.ts          # shadcn cn() helper
├── stores/               # Zustand stores
│   └── auth-store.ts     # Estado de auth + role (fonte única de verdade)
├── hooks/                # Custom hooks
│   └── use-auth.ts       # Hook de conveniência sobre auth-store
└── types/                # TypeScript types
    └── index.ts
```

## Auth flow

1. Aluno/Professor clica em "Entrar com Google".
2. Supabase Auth redireciona pro Google OAuth.
3. Google retorna token para `/auth/callback`.
4. Rota `/auth/callback` processa o token via `supabase.auth.exchangeCodeForSession()`.
5. Trigger no Postgres (`AFTER INSERT ON auth.users`) cria registro em `profiles`:
   - `@al.unieduk.com.br` → role `student`
   - `@prof.unieduk.com.br` → role `teacher`
   - Qualquer outro domínio → role `denied`
6. `providers.tsx` escuta `onAuthStateChange`, lê `profiles.role` e atualiza Zustand.
7. Se role é `denied`, redireciona para `/unauthorized` e destrói sessão.
8. Se role é `student`, redireciona para `/dashboard`.
9. Se role é `teacher`, redireciona para `/admin`.
10. RLS no Postgres lê `profiles.role` para controlar acesso a todas as tabelas.

### Callback URL

- Dev local: `http://localhost:5173/auth/callback`
- Deve ser registrada no Supabase Auth settings e no Google Cloud Console.
- Rota correspondente em `router.tsx` deve existir.

## Database (MVP — só cadastro)

```sql
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  full_name  text,
  role       text NOT NULL CHECK (role IN ('student', 'teacher', 'denied')),
  created_at timestamptz DEFAULT now()
);

-- Trigger: criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.email LIKE '%@al.unieduk.com.br' THEN 'student'
      WHEN NEW.email LIKE '%@prof.unieduk.com.br' THEN 'teacher'
      ELSE 'denied'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

As tabelas de séries, casos didáticos e tentativas serão definidas quando o módulo de previsão for implementado.

## Variáveis de ambiente

```env
# .env.example (commitado no repo)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- `.env.local` deve estar no `.gitignore`.
- Valores reais nunca commitados.

## Estado de autenticação

Fonte única de verdade: Zustand (`auth-store.ts`).

`providers.tsx` faz o bootstrap:
1. Na montagem, chama `supabase.auth.getSession()` pra recuperar sessão existente.
2. Registra `supabase.auth.onAuthStateChange()` pra manter o store sincronizado.
3. Quando há sessão ativa, busca `profiles.role` e atualiza o store.

Nenhum outro componente acessa Supabase Auth diretamente — tudo passa pelo Zustand store.

## Roteamento protegido

```
/                  → Login.tsx (público)
/auth/callback     → Processa OAuth callback
/dashboard         → Dashboard.tsx (student only)
/admin             → AdminDashboard.tsx (teacher only)
/unauthorized      → Unauthorized.tsx (público)
```

`ProtectedRoute` verifica se há sessão ativa. `RoleRoute` verifica se a role do usuário corresponde à exigida pela rota. Ambos leem do Zustand store.

## Dashboard shell do aluno

O dashboard do aluno terá:
- Header com nome e email do aluno.
- Trilha visual dos 6 módulos PCP (todos visíveis, só o primeiro clicável no futuro).
- Área de conteúdo central vazia — preparada para receber o módulo de previsão como componente.

O módulo de previsão será adicionado como rota aninhada (`/dashboard/previsao`) ou como componente renderizado na área central.

## Dashboard shell do professor

Página mínima que prova o roteamento por role:
- Header com nome e email do professor.
- Mensagem: "Painel do professor — em construção."

Funcionalidades do professor (gestão de casos, acompanhamento de alunos) são escopo futuro.

## Pacotes

| Pacote | Função |
|--------|--------|
| `vite` + `@vitejs/plugin-react-swc` | Build + HMR |
| `react` + `react-dom` | UI |
| `react-router-dom` | Rotas |
| `tailwindcss` + `shadcn/ui` | Estilo + componentes |
| `@supabase/supabase-js` | Client Supabase |
| `zustand` | Estado global |

Pacotes futuros (não instalados no setup):
- `recharts` — gráficos do módulo de previsão
- LLM SDK (a definir) — assistente de IA didático

## Setup via CLIs

```bash
npm create vite@latest . -- --template react-swc-ts
npx shadcn@latest init
npm i @supabase/supabase-js zustand react-router-dom
```

## Fora do escopo (futuro)

- Módulo de previsão de demanda (próxima etapa)
- Assistente de IA didático (LLM + framework tipo Mastra)
- Edge Functions para lógica de cálculo (MAD, métodos de previsão)
- Gráficos (recharts)
- Dashboard funcional do professor
- Deploy

## Design System

Referência completa em `docs/prd-design-system.md`. Os tokens de cor e tipografia serão aplicados sobre o tema do shadcn/ui após o setup.
