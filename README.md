# ProdLab

> Laboratório Didático de Planejamento e Controle da Produção

Plataforma educacional que simula, de forma guiada e didática, as principais etapas do planejamento e controle de um sistema produtivo. O sistema funciona como um **MRPII didático**: o aluno recebe dados de demanda de uma família de produtos e percorre toda a cadeia de decisão do PCP, desde a previsão de demanda até o sequenciamento final das operações.

## Público-alvo

Alunos de Engenharia de Produção da Unimax/Unieduk, cursando a disciplina de Planejamento e Controle da Produção.

## Módulos

```
Previsão de Demanda → Planejamento Agregado → Planejamento Desagregado → PMP → MRP → Scheduling
```

Cada etapa consome a saída da anterior, com feedback didático e possibilidade de nova tentativa.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + TypeScript + SWC |
| Estilo | Tailwind CSS + shadcn/ui |
| Estado | Zustand |
| Backend | Supabase Cloud (Postgres + Auth + Edge Functions) |
| Auth | Google OAuth (domínios institucionais) |
| Roteamento | React Router DOM |

## Estrutura do projeto

```
src/
├── app/              # App root, providers, router
├── pages/            # Páginas por rota
├── components/       # Componentes reutilizáveis + shadcn/ui
├── lib/              # Supabase client, utilitários
├── stores/           # Zustand stores
├── hooks/            # Custom hooks
└── types/            # TypeScript types

docs/                 # Documentação do projeto
├── 01-visao-geral.md
├── 02-modulo-previsao-demanda.md
├── prd-design-system.md
└── superpowers/
    ├── specs/        # Especificações técnicas
    └── plans/        # Planos de implementação

supabase/
└── migrations/       # SQL migrations
```

## Setup local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Rodar em dev
npm run dev
```

## Auth

Login via Google OAuth institucional:
- `@al.unieduk.com.br` → Aluno
- `@prof.unieduk.com.br` → Professor
- Outros domínios → Acesso negado
