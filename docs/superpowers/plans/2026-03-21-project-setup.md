# ProdLab — Setup Inicial

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold completo do ProdLab com auth Google OAuth, roteamento protegido por role, e dashboard shells prontos para receber módulos.

**Architecture:** SPA React com Vite + TypeScript. Supabase Cloud para auth (Google OAuth) e database (Postgres + RLS). Estado via Zustand. Homepage é a tela de login.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS, Zustand, React Router DOM

**Spec:** `docs/superpowers/specs/2026-03-21-project-setup-design.md`

**Design System:** `docs/prd-design-system.md`

---

## File Map

```
src/
├── app/
│   ├── App.tsx              — Root component, wraps router with providers
│   ├── router.tsx           — Definição de rotas (react-router-dom)
│   └── providers.tsx        — Bootstrap Supabase auth listener → Zustand
├── pages/
│   ├── Login.tsx            — Homepage, botão Google OAuth
│   ├── AuthCallback.tsx     — Processa retorno do OAuth
│   ├── Dashboard.tsx        — Shell do aluno (trilha + área plugável)
│   ├── AdminDashboard.tsx   — Shell do professor (placeholder)
│   └── Unauthorized.tsx     — Acesso negado
├── components/
│   ├── ui/                  — shadcn/ui components (gerado via CLI)
│   ├── ProtectedRoute.tsx   — Guard: requer sessão ativa
│   └── RoleRoute.tsx        — Guard: requer role específica
├── lib/
│   ├── supabase.ts          — Supabase client singleton
│   └── utils.ts             — shadcn cn() helper (gerado via CLI)
├── stores/
│   └── auth-store.ts        — Zustand store: user, role, loading, actions
├── hooks/
│   └── use-auth.ts          — Hook de conveniência sobre auth-store
├── types/
│   └── index.ts             — Tipos compartilhados (UserRole, Profile)
├── main.tsx                 — Entry point (gerado pelo Vite, ajustado)
└── index.css                — Tailwind directives + custom tokens (gerado pelo shadcn)

.env.example                 — Template de variáveis de ambiente
.gitignore                   — Atualizado com .env.local
supabase/migrations/         — SQL migrations
└── 00001_create_profiles.sql — Tabela profiles + trigger + RLS
```

---

## Task 0: Setup manual do Supabase Cloud

> Esta task é feita manualmente no navegador, não via código.

**Pré-requisito:** Ter uma conta no [supabase.com](https://supabase.com).

- [ ] **Step 1: Criar projeto no Supabase**

1. Acessar [app.supabase.com](https://app.supabase.com)
2. Clicar "New Project"
3. Nome: `prodlab`
4. Região: escolher a mais próxima (ex: South America - São Paulo)
5. Gerar e salvar a database password em local seguro
6. Aguardar o projeto ser provisionado

- [ ] **Step 2: Copiar credenciais**

Após criação, em **Settings → API**:
- Copiar `Project URL` → será o `VITE_SUPABASE_URL`
- Copiar `anon public` key → será o `VITE_SUPABASE_ANON_KEY`

Guardar esses valores — serão usados na Task 5 (`.env.local`).

- [ ] **Step 3: Configurar Google OAuth provider**

Em **Authentication → Providers → Google**:
1. Ativar o provider Google
2. Anotar o **Callback URL** que o Supabase fornece (ex: `https://xxx.supabase.co/auth/v1/callback`)

- [ ] **Step 4: Configurar Google Cloud Console**

1. Acessar [console.cloud.google.com](https://console.cloud.google.com)
2. Criar ou selecionar um projeto
3. Ir em **APIs & Services → Credentials → Create OAuth Client ID**
4. Tipo: Web Application
5. Nome: `ProdLab`
6. Authorized redirect URIs: adicionar o Callback URL do Supabase (do step 3)
7. Adicionar também `http://localhost:5173/auth/callback` para dev local
8. Salvar e copiar o **Client ID** e **Client Secret**

- [ ] **Step 5: Inserir credenciais Google no Supabase**

Voltar ao Supabase → **Authentication → Providers → Google**:
1. Colar o Client ID
2. Colar o Client Secret
3. Salvar

- [ ] **Step 6: Configurar Redirect URLs no Supabase**

Em **Authentication → URL Configuration**:
1. Site URL: `http://localhost:5173`
2. Redirect URLs: adicionar `http://localhost:5173/auth/callback`

- [ ] **Step 7: Executar migration SQL**

Em **SQL Editor** (no Supabase Dashboard):
1. Colar o conteúdo de `supabase/migrations/00001_create_profiles.sql` (criado na Task 11)
2. Executar
3. Verificar em **Table Editor** que a tabela `profiles` existe

> **Nota sobre Supabase local com Docker:** É possível rodar o Supabase localmente via `npx supabase init` + `npx supabase start` (requer Docker). Isso cria uma instância local completa (Postgres, Auth, etc.) e facilita testes sem afetar a instância cloud. Para o MVP, usar a instância cloud é mais simples. Se quiser configurar local depois, consultar: [supabase.com/docs/guides/local-development](https://supabase.com/docs/guides/local-development).

---

## Task 1: Scaffold Vite + React + TypeScript

**Files:**
- Create: projeto inteiro via CLI (package.json, vite.config.ts, tsconfig, src/main.tsx, etc.)
- Modify: `.gitignore` (já existe no repo)

- [ ] **Step 1: Criar projeto Vite na raiz**

```bash
npm create vite@latest . -- --template react-swc-ts
```

> Nota: o diretório já contém `docs/`. O Vite vai criar os arquivos ao redor. Se pedir confirmação sobre diretório não vazio, confirmar.

- [ ] **Step 2: Instalar dependências**

```bash
npm install
```

- [ ] **Step 3: Verificar que o dev server roda**

```bash
npm run dev
```

Esperado: servidor sobe em `http://localhost:5173` com a página default do Vite + React.

- [ ] **Step 4: Parar o dev server e commitar**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript + SWC"
```

---

## Task 2: Setup shadcn/ui + Tailwind CSS

**Files:**
- Modify: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`
- Create: `src/lib/utils.ts`, `components.json`, `src/index.css` (sobrescreve)
- Create: `src/components/ui/` (via CLI ao adicionar componentes)

- [ ] **Step 1: Inicializar shadcn/ui**

```bash
npx shadcn@latest init
```

Quando perguntado, selecionar:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Isso instala Tailwind CSS, configura PostCSS, cria `components.json`, `src/lib/utils.ts` e atualiza `src/index.css`.

- [ ] **Step 2: Adicionar componentes shadcn necessários**

```bash
npx shadcn@latest add button card input
```

- [ ] **Step 3: Verificar que o build passa**

```bash
npm run build
```

Esperado: build sem erros.

- [ ] **Step 4: Commitar**

```bash
git add -A
git commit -m "chore: setup shadcn/ui + Tailwind CSS com componentes base"
```

---

## Task 3: Aplicar Design Tokens do ProdLab

**Files:**
- Modify: `src/index.css`

Os tokens do design system (`docs/prd-design-system.md`) precisam ser aplicados sobre o tema shadcn.

- [ ] **Step 1: Atualizar CSS variables em `src/index.css`**

Adicionar/sobrescrever as variáveis CSS na seção `:root` e `.dark` do arquivo gerado pelo shadcn. Mapear os tokens do ProdLab para as variáveis do shadcn:

```css
/* Tokens ProdLab — adicionar/sobrescrever no :root junto com os do shadcn */
--color-primary: #0B2046;
--color-background: #F8F9FA;
--color-surface: #FFFFFF;
--color-text: #1A1D24;
--color-muted: #8E98A8;
--color-accent: #FDB913;
--color-success: #10B981;
--color-error: #EF4444;

--font-heading: 'Outfit', sans-serif;
--font-body: 'Outfit', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--font-action: 'Space Grotesk', sans-serif;

--radius: 8px;
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);

--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

> Nota: os nomes exatos das variáveis CSS do shadcn dependem da versão instalada. O implementador deve mapear os tokens do ProdLab para os nomes corretos do shadcn (ex: `--primary`, `--background`, `--muted`, etc.) mantendo compatibilidade.

- [ ] **Step 2: Adicionar import das Google Fonts no `index.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&family=Outfit:wght@400;500;700&family=Space+Grotesk:wght@600&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Verificar visualmente**

```bash
npm run dev
```

Abrir no navegador, inspecionar que as fonts carregam e as cores estão aplicadas.

- [ ] **Step 4: Commitar**

```bash
git add src/index.css index.html
git commit -m "style: aplica design tokens ProdLab (cores, tipografia, radius)"
```

---

## Task 4: Instalar dependências do projeto

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Instalar Supabase, Zustand e React Router**

```bash
npm i @supabase/supabase-js zustand react-router-dom
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: sem erros.

- [ ] **Step 3: Commitar**

```bash
git add package.json package-lock.json
git commit -m "chore: adiciona supabase-js, zustand e react-router-dom"
```

---

## Task 5: Configurar variáveis de ambiente e cliente Supabase

**Files:**
- Create: `.env.example`
- Create: `src/lib/supabase.ts`
- Create: `src/types/index.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Criar `.env.example`**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Garantir `.env.local` no `.gitignore`**

Verificar que `.gitignore` contém:
```
.env.local
.env.*.local
```

Se não tiver, adicionar.

- [ ] **Step 3: Criar types em `src/types/index.ts`**

```typescript
export type UserRole = 'student' | 'teacher' | 'denied';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}
```

- [ ] **Step 4: Criar `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 5: Commitar**

```bash
git add .env.example .gitignore src/lib/supabase.ts src/types/index.ts
git commit -m "feat: configura cliente Supabase e tipos base"
```

---

## Task 6: Criar Zustand auth store

**Files:**
- Create: `src/stores/auth-store.ts`
- Create: `src/hooks/use-auth.ts`

- [ ] **Step 1: Criar `src/stores/auth-store.ts`**

```typescript
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  initialized: boolean;
  setAuth: (user: User | null, role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchRole: (userId: string) => Promise<UserRole | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  initialized: false,

  setAuth: (user, role) => set({ user, role }),
  setLoading: (loading) => set({ loading }),
  setInitialized: () => set({ initialized: true }),

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },

  fetchRole: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data.role as UserRole;
  },
}));
```

- [ ] **Step 2: Criar `src/hooks/use-auth.ts`**

```typescript
import { useAuthStore } from '../stores/auth-store';

export function useAuth() {
  const { user, role, loading, initialized, signInWithGoogle, signOut } =
    useAuthStore();

  return {
    user,
    role,
    loading,
    initialized,
    isAuthenticated: !!user,
    isStudent: role === 'student',
    isTeacher: role === 'teacher',
    isDenied: role === 'denied',
    signInWithGoogle,
    signOut,
  };
}
```

- [ ] **Step 3: Commitar**

```bash
git add src/stores/auth-store.ts src/hooks/use-auth.ts
git commit -m "feat: cria Zustand auth store e hook useAuth"
```

---

## Task 7: Criar AuthProvider (bootstrap de sessão)

**Files:**
- Create: `src/app/providers.tsx`

- [ ] **Step 1: Criar `src/app/providers.tsx`**

```typescript
import { useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, setLoading, setInitialized, fetchRole } = useAuthStore();

  useEffect(() => {
    // 1. Recuperar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setAuth(session.user, role);
      }
      setLoading(false);
      setInitialized();
    });

    // 2. Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = await fetchRole(session.user.id);
        setAuth(session.user, role);
      } else if (event === 'SIGNED_OUT') {
        setAuth(null, null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading, setInitialized, fetchRole]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/app/providers.tsx
git commit -m "feat: cria AuthProvider com bootstrap de sessão Supabase"
```

---

## Task 8: Criar route guards (ProtectedRoute + RoleRoute)

**Files:**
- Create: `src/components/ProtectedRoute.tsx`
- Create: `src/components/RoleRoute.tsx`

- [ ] **Step 1: Criar `src/components/ProtectedRoute.tsx`**

```typescript
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Criar `src/components/RoleRoute.tsx`**

```typescript
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import type { UserRole } from '../types';

interface RoleRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export function RoleRoute({ children, allowedRole }: RoleRouteProps) {
  const { role, isDenied } = useAuth();

  if (isDenied) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 3: Commitar**

```bash
git add src/components/ProtectedRoute.tsx src/components/RoleRoute.tsx
git commit -m "feat: cria guards ProtectedRoute e RoleRoute"
```

---

## Task 9: Criar páginas

**Files:**
- Create: `src/pages/Login.tsx`
- Create: `src/pages/AuthCallback.tsx`
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/AdminDashboard.tsx`
- Create: `src/pages/Unauthorized.tsx`

- [ ] **Step 1: Criar `src/pages/Login.tsx`**

Homepage do app. Card centralizado com botão Google OAuth. Responsivo: card max 400px no desktop, 100% no mobile.

```typescript
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/use-auth';

export function Login() {
  const { isAuthenticated, role, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'student') navigate('/dashboard', { replace: true });
      else if (role === 'teacher') navigate('/admin', { replace: true });
      else if (role === 'denied') navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
          >
            ProdLab
          </CardTitle>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Laboratório Didático de PCP
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGoogle}
            className="w-full h-12 text-base font-semibold"
            style={{
              fontFamily: 'var(--font-action)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
            }}
          >
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Criar `src/pages/AuthCallback.tsx`**

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

export function AuthCallback() {
  const navigate = useNavigate();
  const { fetchRole, setAuth } = useAuthStore();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(async ({ data, error }) => {
      if (error || !data.session) {
        navigate('/', { replace: true });
        return;
      }

      const user = data.session.user;
      const role = await fetchRole(user.id);

      if (role === 'denied' || !role) {
        await supabase.auth.signOut();
        setAuth(null, null);
        navigate('/unauthorized', { replace: true });
        return;
      }

      setAuth(user, role);

      if (role === 'student') navigate('/dashboard', { replace: true });
      else if (role === 'teacher') navigate('/admin', { replace: true });
    });
  }, [navigate, fetchRole, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
    </div>
  );
}
```

- [ ] **Step 3: Criar `src/pages/Dashboard.tsx`**

Shell do aluno com trilha de módulos e área plugável. Responsivo.

```typescript
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const MODULES = [
  { id: 1, name: 'Previsão de Demanda', active: false },
  { id: 2, name: 'Planejamento Agregado', active: false },
  { id: 3, name: 'Planejamento Desagregado', active: false },
  { id: 4, name: 'Programa Mestre (PMP)', active: false },
  { id: 5, name: 'MRP', active: false },
  { id: 6, name: 'Scheduling', active: false },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 lg:px-8"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ProdLab
          </h1>
          <span className="text-sm text-white/70 hidden sm:inline">
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 hidden md:inline">
            {user?.email}
          </span>
          <Button variant="ghost" onClick={signOut} className="text-white hover:text-white/80 min-h-[44px] min-w-[44px]">
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Trilha de módulos */}
        <nav className="mb-8 overflow-x-auto">
          <ol className="flex gap-2 min-w-max">
            {MODULES.map((mod) => (
              <li key={mod.id} className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: mod.active ? 'var(--color-accent)' : 'var(--color-muted)',
                    color: mod.active ? 'var(--color-primary)' : '#FFFFFF',
                    fontFamily: 'var(--font-action)',
                  }}
                >
                  {mod.id}
                </span>
                <span
                  className="text-sm hidden md:inline"
                  style={{
                    color: mod.active ? 'var(--color-text)' : 'var(--color-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {mod.name}
                </span>
                {mod.id < MODULES.length && (
                  <span className="text-[var(--color-muted)]">→</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Área de conteúdo — plugável */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="text-lg font-semibold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Bem-vindo ao ProdLab
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              Os módulos serão habilitados em breve.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Criar `src/pages/AdminDashboard.tsx`**

```typescript
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header
        className="flex items-center justify-between px-4 py-3 lg:px-8"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ProdLab — Professor
          </h1>
          <span className="text-sm text-white/70 hidden sm:inline">
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 hidden md:inline">
            {user?.email}
          </span>
          <Button variant="ghost" onClick={signOut} className="text-white hover:text-white/80 min-h-[44px] min-w-[44px]">
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Painel do professor — em construção
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            Funcionalidades de gestão serão adicionadas em breve.
          </p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Criar `src/pages/Unauthorized.tsx`**

```typescript
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/auth-store';
import { useNavigate } from 'react-router-dom';

export function Unauthorized() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleGoBack = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle
            className="text-xl font-bold"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-heading)' }}
          >
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            Apenas emails institucionais (@al.unieduk.com.br ou @prof.unieduk.com.br) podem acessar o ProdLab.
          </p>
          <Button
            onClick={handleGoBack}
            className="w-full"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-action)',
            }}
          >
            Voltar para o login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 6: Commitar**

```bash
git add src/pages/
git commit -m "feat: cria páginas Login, AuthCallback, Dashboard, AdminDashboard e Unauthorized"
```

---

## Task 10: Criar router e App root

**Files:**
- Create: `src/app/router.tsx`
- Create: `src/app/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Criar `src/app/router.tsx`**

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthCallback } from '../pages/AuthCallback';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { Unauthorized } from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <Dashboard />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="teacher">
          <AdminDashboard />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
]);
```

- [ ] **Step 2: Criar `src/app/App.tsx`**

```typescript
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers';
import { router } from './router';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

> Nota: Zustand usa um store em nível de módulo (não React Context), então `AuthProvider` fora de `RouterProvider` funciona corretamente — o `useEffect` do provider inicializa o listener e o store é acessível em qualquer componente do router.

- [ ] **Step 3: Atualizar `src/main.tsx`**

Remover o conteúdo default do Vite e montar o App:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Limpar arquivos default do Vite**

Remover arquivos que não são mais necessários:

```bash
rm -f src/App.tsx src/App.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

Esperado: build sem erros.

- [ ] **Step 6: Commitar**

```bash
git add -A
git commit -m "feat: cria router, App root e conecta tudo no main.tsx"
```

---

## Task 11: Criar migration SQL do Supabase

**Files:**
- Create: `supabase/migrations/00001_create_profiles.sql`

Esta migration não é executada automaticamente — é documentação executável. O implementador deve rodar no Supabase SQL Editor ou via Supabase CLI.

- [ ] **Step 1: Criar diretório e arquivo**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Criar `supabase/migrations/00001_create_profiles.sql`**

```sql
-- Tabela de perfis dos usuários
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

- [ ] **Step 3: Commitar**

```bash
git add supabase/
git commit -m "feat: adiciona migration SQL para tabela profiles com trigger e RLS"
```

---

## Task 12: Verificação final e teste manual

**Files:** Nenhum novo. Verificação do sistema completo.

- [ ] **Step 1: Criar `.env.local` com credenciais reais**

Copiar `.env.example` para `.env.local` e preencher com URL e anon key do projeto Supabase.

```bash
cp .env.example .env.local
```

Editar `.env.local` com os valores reais.

- [ ] **Step 2: Executar a migration no Supabase**

Acessar o Supabase Dashboard → SQL Editor → Colar e executar o conteúdo de `supabase/migrations/00001_create_profiles.sql`.

- [ ] **Step 3: Configurar Google OAuth no Supabase**

No Supabase Dashboard → Authentication → Providers → Google:
- Ativar Google provider.
- Adicionar `http://localhost:5173/auth/callback` como redirect URL.
- Configurar Google Cloud Console com o Client ID e Secret.

- [ ] **Step 4: Testar o fluxo completo**

```bash
npm run dev
```

Checklist de teste manual:

1. Abrir `http://localhost:5173` → deve ver a tela de Login.
2. Clicar "Entrar com Google" → redireciona pro Google.
3. Logar com email `@al.unieduk.com.br` → redireciona para `/dashboard` com trilha de módulos.
4. Logar com email `@prof.unieduk.com.br` → redireciona para `/admin` com mensagem "em construção".
5. Logar com email de outro domínio → redireciona para `/unauthorized`.
6. Na dashboard, clicar "Sair" → volta pro login.
7. Testar responsividade: redimensionar para 375px → layout deve adaptar.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "chore: verificação final do setup completo"
```
