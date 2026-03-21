# Unimax SAP Edu - Minimalista Gamificado

## Visão Geral do Produto

**Proposta:** Um simulador SAP gamificado, mobile-first, que transforma fluxos densos de Planejamento e Controle da Produção (PCP) em missões curtas e envolventes. Elimina a complexidade avassaladora dos ERPs legados, focando puramente em mecânicas educacionais essenciais e feedback imediato.

**Para:** Estudantes de engenharia de produção da Unimax que precisam de experiência prática em ERP sem a curva de aprendizado íngreme das interfaces reais do SAP.

**Dispositivo:** Desktop (PC) primário, responsivo para mobile

**Direção de Design:** Precisão acadêmica encontra gamificação moderna. Azul escuro de alto contraste e amarelo vibrante, fundos brancos austeros e tipografia geométrica em negrito criam um ambiente que é simultaneamente autoritativo e lúdico.

**Inspirado em:** Duolingo (mecânicas de progresso), Linear (execução minimalista de tarefas)

---

## Telas

- **[Home Dashboard]:** Hub central que acompanha o XP do aluno e exibe a missão PCP ativa.
- **[Terminal SAP]:** Tela de transação simulada e minimalista onde os alunos executam comandos PCP (ex: MD04, CO01).
- **[Inventário]:** Representação visual dos níveis de estoque simulado e necessidades de material do aluno.
- **[Ranking]:** Placar baseado em grupos para impulsionar o engajamento competitivo.

---

## Fluxos Principais

**[Executar Ordem de Produção]:** Aluno completa uma transação PCP obrigatória.

1. Usuário está no [Home Dashboard] -> vê **Missão Atual: Criar Ordem (CO01)**
2. Usuário clica em **Iniciar Simulação** -> Entra no [Terminal SAP]
3. Usuário digita `CO01` e os códigos de material necessários -> Clica em **Executar**
4. Modal de sucesso aparece com `+50 XP`, desbloqueia a próxima etapa.

---

## Design System

### Paleta de Cores

- **Primária:** `#0B2046` - Azul Escuro Unimax (Cabeçalhos, ações primárias, texto pesado)
- **Fundo:** `#F8F9FA` - Branco suave (Fundo principal do app, reduz cansaço visual)
- **Superfície:** `#FFFFFF` - Branco nítido (Cards, campos de entrada, modais)
- **Texto:** `#1A1D24` - Quase preto (Corpo do texto)
- **Secundário:** `#8E98A8` - Cinza frio (Texto secundário, bordas, estados inativos)
- **Destaque:** `#FDB913` - Amarelo Unimax (Badges de XP, CTAs primários, estados ativos, barras de progresso)
- **Sucesso:** `#10B981` - Esmeralda (Missão completa, entradas corretas)

### Tipografia

- **Títulos:** Outfit, 700, 24-32px
- **Corpo:** Outfit, 400, 16px
- **Texto pequeno:** Outfit, 500, 12px
- **Botões:** Space Grotesk, 600, 16px
- **Código/Terminal:** JetBrains Mono, 400, 14px

**Notas de estilo:** Border radius 0px nos inputs para imitar a rigidez do ERP legado, contrastando com border radius 16px nos cards gamificados. Sombras profundas e nítidas (`0 4px 0 #0B2046`) nos botões amarelos para um efeito tátil de "pressionar", estilo jogo.

### Tokens de Design

```css
:root {
  --color-primary: #0B2046;
  --color-background: #F8F9FA;
  --color-surface: #FFFFFF;
  --color-text: #1A1D24;
  --color-muted: #8E98A8;
  --color-accent: #FDB913;
  --color-success: #10B981;
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-action: 'Space Grotesk', sans-serif;
  --radius-card: 16px;
  --radius-input: 0px;
  --shadow-button: 0 4px 0 #0B2046;
  --shadow-button-pressed: 0 0px 0 #0B2046;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

---

## Especificações das Telas

### [Home Dashboard]

**Objetivo:** Acompanhar o progresso e iniciar o próximo exercício PCP.

**Layout:** Navegação lateral esquerda (desktop) ou navegação inferior (mobile). Área de conteúdo central com layout multi-coluna para missões e estatísticas.

**Elementos Principais:**
- **[Header Stats]:** Nome do aluno alinhado à esquerda, pill de XP alinhada à direita (fundo `#FDB913`, texto `#0B2046`, negrito).
- **[Card de Missão Ativa]:** Card branco grande, radius 16px, borda `2px solid #0B2046`. Botão CTA amarelo grande **Iniciar Missão**.
- **[Mapa de Progresso]:** Timeline vertical conectando conceitos PCP passados (esmaecidos) e futuros (bloqueados).

**Estados:**
- **Vazio:** N/A (sempre inicia na Missão 1).
- **Carregando:** Skeletons cinza pulsantes para o card de missão ativa.
- **Erro:** Toast vermelho "Erro de conexão ao servidor SAP."

**Componentes:**
- **[Badge de XP]:** Altura 32px, padding horizontal 16px, fundo `#FDB913`, radius 16px.
- **[Botão de Missão]:** Altura 56px, fundo `#FDB913`, `Space Grotesk`, texto `#0B2046`, sombra inferior `4px solid #0B2046`.

**Interações:**
- **Clique no [Botão de Missão]:** Sombra cai para 0px, botão translada Y em 4px, navega para o Terminal SAP.
- **Scroll na [Timeline]:** Rolagem suave elástica.

**Responsivo:**
- **Desktop:** Nav lateral esquerda, área principal em 2 colunas (Timeline à esquerda, Missão Ativa e Stats à direita).
- **Mobile:** Cards 100% de largura, nav inferior, layout empilhado.

### [Terminal SAP]

**Objetivo:** Simulação minimalista da GUI do SAP para execução de transações.

**Layout:** Barra de comando superior de largura total, formulário de workspace central centralizado em um card grande (desktop) ou largura total (mobile).

**Elementos Principais:**
- **[Barra de Comando]:** Barra superior fixa, campo de entrada com radius `0px` e ícone de busca. Label: **Transação**. Fonte: `JetBrains Mono`.
- **[Área do Formulário]:** Campos dinâmicos baseados na transação (ex: Material, Centro, Quantidade). Fundo `#FFFFFF` estrito, inputs quadrados e afiados.
- **[Botão Executar]:** CTA fixo inferior, largura total, fundo `#0B2046`, texto `#FFFFFF`.

**Estados:**
- **Vazio:** Área do formulário em branco até que um T-Code válido (ex: MD04) seja inserido.
- **Carregando:** Loader giratório amarelo Unimax no centro.
- **Erro:** Bordas do input ficam vermelhas, texto inline "Material inválido" em `12px`.

**Componentes:**
- **[Input Terminal]:** Altura 48px, `1px solid #0B2046`, radius `0px`, fonte monospace.
- **[CTA Executar]:** Altura 64px, largura total na parte inferior (ou alinhado à direita no desktop), sem margens.

**Interações:**
- **Clique no [Botão Executar]:** Valida entrada -> Dispara overlay de sucesso em tela cheia com checkmark verde e "+50 XP".

**Responsivo:**
- **Desktop:** Workspace centralizado com max-width (ex: 800px). Barra de comando integrada ao header. CTA Executar pode ser alinhado ao canto inferior direito do card do formulário.
- **Mobile:** Teclado empurra botão fixo para cima, inputs de largura total.

### [Inventário]

**Objetivo:** Feedback visual das ações do aluno sobre o estoque simulado do almoxarifado.

**Layout:** Grid de métricas resumidas no topo. Área de conteúdo principal com lista de materiais (esquerda) e painel detalhado de BOM (direita no desktop).

**Elementos Principais:**
- **[Cards de Métricas de Estoque]:** Layout em grid. Valor no topo (ex: `1.200`), label embaixo (ex: `Peças em Estoque`).
- **[Linha de Material]:** Flex horizontal. Esquerda: Código do Material (`JetBrains Mono`). Direita: Pill de status (Verde = OK, Vermelho = Falta).
- **[Banner de Alerta]:** Banner amarelo no topo se um item necessita produção (gatilho MRP).

**Estados:**
- **Vazio:** "Nenhum material cadastrado." com botão para ir ao MM01.
- **Carregando:** Linhas com efeito shimmer.
- **Erro:** "Falha ao carregar o banco de dados."

**Componentes:**
- **[Pill de Status]:** Altura 24px, padding 8px, fonte `12px`, radius 4px.
- **[Card de Métrica]:** Altura 88px, fundo `#FFFFFF`, `1px solid #E5E7EB`.

**Interações:**
- **Clique na [Linha de Material]:** Abre BOM (Lista de Materiais) detalhada no painel direito (Desktop) ou expande para baixo (Mobile).

**Responsivo:**
- **Desktop:** Grid de métricas em 4 colunas. Layout lado a lado: Lista de materiais (esquerda 60%) e painel BOM detalhado persistente (direita 40%).
- **Mobile:** Grid de métricas em 2 colunas, lista em 1 coluna. Linhas expandem para baixo ao clicar.

### [Ranking]

**Objetivo:** Hub de gamificação para fomentar competição entre grupos.

**Layout:** Layout lado a lado (desktop): Pódio à esquerda, lista classificada à direita. Layout empilhado no mobile.

**Elementos Principais:**
- **[Pódio]:** Degraus visuais para 1º, 2º e 3º lugar dos grupos. Amarelo Unimax para o 1º lugar.
- **[Lista de Classificação]:** Lista vertical de grupos. Destaque do grupo atual do usuário com fundo sutil `#F8F9FA` e borda esquerda `#0B2046`.
- **[Avatar do Grupo]:** Círculo com iniciais (ex: `G1`), diâmetro 40px.

**Estados:**
- **Vazio:** "Ranking em processamento."
- **Carregando:** Itens da lista fantasma.
- **Erro:** "Não foi possível carregar o placar."

**Componentes:**
- **[Item da Lista]:** Altura 64px, flex row. Número do rank (cinza), Avatar, Nome do Grupo, XP total (negrito).
- **[Coroa do 1º Lugar]:** Ícone SVG amarelo 24x24px.

**Interações:**
- **Clique no [Item da Lista]:** Abre modal ou painel lateral mostrando membros do grupo e suas contribuições individuais.

**Responsivo:**
- **Desktop:** Layout em tela dividida. Pódio utiliza a metade esquerda da tela, lista classificada ocupa a metade direita.
- **Mobile:** Layout empilhado em largura total. Pódio no topo, lista rolando abaixo.

---

## Guia de Construção

**Stack:** HTML + Tailwind CSS v3

**Ordem de Construção:**
1. **[Home Dashboard]** - Estabelece a linguagem de design gamificada, tipografia (`Outfit` e `Space Grotesk`) e sombras brutalistas dos botões.
2. **[Terminal SAP]** - Introduz a tipografia monospace e o estilo estrito dos campos de entrada necessários para os formulários do simulador.
3. **[Inventário]** - Configura os layouts de lista com alta densidade de dados e componentes de pill de status.
4. **[Ranking]** - Combina listas com hierarquia visual gamificada (pódios, avatares).
