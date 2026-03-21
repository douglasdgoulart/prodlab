# ProdLab — Design System

> Linguagem visual do MRPII didático guiado

---

## Direção de Design

Precisão acadêmica com clareza visual. A interface deve ser limpa e consistente, priorizando a interpretação de dados e o raciocínio do aluno sobre a estética. O visual transmite seriedade institucional (azul Unimax) com pontos de destaque e engajamento (amarelo Unimax).

**Inspirado em:** Duolingo (mecânicas de progresso), Linear (minimalismo e foco)

---

## Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#0B2046` | Cabeçalhos, ações primárias, texto pesado |
| `--color-background` | `#F8F9FA` | Fundo principal do app |
| `--color-surface` | `#FFFFFF` | Cards, campos de entrada, modais |
| `--color-text` | `#1A1D24` | Corpo do texto |
| `--color-muted` | `#8E98A8` | Texto secundário, bordas, estados inativos |
| `--color-accent` | `#FDB913` | CTAs primários, badges, estados ativos, progresso |
| `--color-success` | `#10B981` | Acerto, conclusão, feedback positivo |
| `--color-error` | `#EF4444` | Erro, feedback negativo |

---

## Tipografia

| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| Títulos | Outfit | 700 | 24–32px |
| Corpo | Outfit | 400 | 16px |
| Texto pequeno | Outfit | 500 | 12px |
| Botões | Space Grotesk | 600 | 16px |
| Código/Dados | JetBrains Mono | 400 | 14px |

---

## Estilo

- **Border radius:** 8px uniforme em todos os elementos (inputs, cards, botões, modais).
- **Sombras:** Sutis e consistentes — `0 1px 3px rgba(0,0,0,0.1)` para elevação leve, `0 4px 12px rgba(0,0,0,0.1)` para modais e overlays.
- **Bordas:** `1px solid` usando `--color-muted` com opacidade reduzida para separação visual leve.
- **Espaçamento:** Baseado em múltiplos de 8px.

---

## Tokens de Design

```css
:root {
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
}
```

---

## Telas

### Login

**Objetivo:** Autenticação via Google institucional.

**Layout:** Centralizado vertical e horizontalmente. Logo ProdLab, subtítulo, botão "Entrar com Google".

**Elementos:**
- Logo + nome do projeto.
- Subtítulo: "Laboratório Didático de PCP".
- Botão Google OAuth com fundo `--color-primary` e texto branco.
- Mensagem de erro inline caso o domínio não seja institucional.

### Dashboard do Aluno

**Objetivo:** Hub central do aluno. Área preparada para receber módulos.

**Layout:** Header fixo no topo. Área de conteúdo central com largura máxima (ex: 1024px).

**Elementos:**
- **Header:** Nome do aluno à esquerda, email à direita.
- **Trilha de Módulos:** Barra horizontal ou vertical mostrando os 6 módulos PCP em sequência. Primeiro módulo clicável (quando implementado), demais bloqueados com visual esmaecido.
- **Área de Conteúdo:** Espaço vazio reservado para o módulo ativo. No MVP, exibe mensagem de boas-vindas ou card do primeiro módulo.

**Responsivo:**
- **Desktop:** Trilha horizontal no topo da área de conteúdo, conteúdo centralizado.
- **Mobile:** Trilha compacta, conteúdo 100% largura.

### Dashboard do Professor

**Objetivo:** Prova de roteamento por role. Funcionalidades futuras.

**Layout:** Mesmo header do aluno, área de conteúdo com mensagem "Painel do professor — em construção."

### Módulo de Previsão de Demanda (futuro)

**Objetivo:** Primeira atividade didática do ProdLab.

**Layout:** Três colunas no desktop (dicas | conteúdo principal | assistente IA). Empilhado no mobile.

**Elementos:**
- Coluna esquerda: Dicas de interpretação do gráfico.
- Área central: Gráfico de demanda, tabela de dados, controles de classificação e método, área de feedback.
- Coluna direita: Assistente de IA didático.
- Barra superior: Trilha visual das 6 etapas.

Especificação completa em `02-modulo-previsao-demanda.md`.

---

## Componentes base

Todos os componentes seguem shadcn/ui como fundação, customizados com os tokens acima.

| Componente | Notas |
|------------|-------|
| Button | Variantes: primary (`--color-accent`), secondary (`--color-primary`), ghost |
| Card | Fundo `--color-surface`, borda `--color-muted/20`, radius `--radius`, sombra `--shadow-sm` |
| Input | Fundo `--color-surface`, borda `--color-muted`, radius `--radius`, fonte `--font-body` |
| Badge | Pequeno, radius `--radius`, variantes por cor (accent, success, error, muted) |
| Toast | Feedback temporário. Variantes: success, error, info |
