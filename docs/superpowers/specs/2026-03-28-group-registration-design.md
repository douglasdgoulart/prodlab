# Fluxo de Cadastro de Grupo do Aluno

**Data:** 2026-03-28
**Branch:** `feature/completar-cadastro`
**Mockups Stitch:** Projeto "Login ProdLab v2" (ID: `10955835608676345049`) -- telas "Cadastro de Grupo - Passo 1", "Formação de Grupo - Passo 1", "Cadastro de Grupo - Passo 2"

---

## 1. Visão geral

Após o login via Google OAuth, o aluno que ainda não possui grupo é direcionado a um wizard de 2 etapas para formar seu grupo de trabalho. O grupo é composto por 2 ou 3 alunos e possui um nome fictício de companhia e uma família de produto (cadastrada previamente pelo professor).

O professor cadastra de antemão:
- A **lista de alunos** (que já existem como `profiles` no sistema via Google OAuth)
- As **famílias de produto** com nome e tipo de tendência (sazonalidade, crescimento, decrescimento, constância, sazonal c/ crescimento, sazonal c/ declínio)

O tipo de tendência da família de produto **não é visível para o aluno** -- é um dado pedagógico interno utilizado nos módulos subsequentes.

---

## 2. Roteamento de entrada

```
Login -> OAuth callback -> Verifica perfil
  |-- Aluno tem grupo com status "complete"? -> Dashboard (módulos)
  |-- Aluno tem grupo com status "forming"? -> Etapa 2 (detalhes)
  |-- Aluno tem grupo com reservas todas expiradas? -> Deleta grupo, vai pra Etapa 1
  |-- Aluno não tem grupo? -> Etapa 1 (formar grupo)
```

Enquanto o cadastro não estiver completo, o aluno vê o `AppHeader` e `AppFooter` existentes, mas **sem acesso à navegação de módulos** (`ModuleTrail`). O stepper do wizard substitui a navegação de módulos.

---

## 3. Modelo de dados

### 3.1 Nova tabela: `product_families`

Cadastrada pelo professor.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid, PK | Identificador |
| `name` | text, NOT NULL | Ex: "Cerveja Artesanal" |
| `trend_type` | text, NOT NULL, CHECK | Enum: `seasonal`, `growth`, `decline`, `stable`, `seasonal_growth`, `seasonal_decline` |
| `created_by` | uuid, FK -> profiles | Professor que cadastrou |
| `created_at` | timestamptz | Auto |

### 3.2 Nova tabela: `groups`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid, PK | Identificador |
| `company_name` | text, nullable | Nome fictício da companhia (preenchido na etapa 2) |
| `product_family_id` | uuid, FK -> product_families, nullable | Família de produto (preenchida na etapa 2) |
| `status` | text, NOT NULL, CHECK | `forming` (etapa 1 ok) ou `complete` (etapa 2 ok) |
| `created_by` | uuid, FK -> profiles | Aluno que iniciou o grupo |
| `created_at` | timestamptz | Auto |

### 3.3 Nova tabela: `group_members`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid, PK | Identificador |
| `group_id` | uuid, FK -> groups | Grupo |
| `student_id` | uuid, FK -> profiles, UNIQUE | Um aluno só pode estar em um grupo |
| `status` | text, NOT NULL, CHECK | `reserved` (lock temporário) ou `confirmed` (grupo finalizado) |
| `reserved_at` | timestamptz | Timestamp da reserva, para expiração |
| `created_at` | timestamptz | Auto |

**Constraint UNIQUE em `student_id`:** Garante no nível do banco que um aluno não pode pertencer a dois grupos simultaneamente.

**Expiração de reservas:** Reservas com `status = 'reserved'` e `reserved_at` mais antiga que 10 minutos são consideradas expiradas. Verificado via query (sem necessidade de cron job). Quando o aluno volta ao sistema e suas reservas expiraram, ele recomeça a etapa 1.

### 3.4 View: `available_students`

View ou Supabase function que retorna **apenas `id` e `full_name`** dos alunos que:
- Têm `role = 'student'`
- **Não** possuem `group_members` com `status = 'confirmed'`
- **Não** possuem `group_members` com `status = 'reserved'` e `reserved_at` dentro dos últimos 10 minutos

Essa view é a única interface de leitura de dados de alunos -- nunca se expõe email ou outros dados do perfil.

### 3.5 RLS (Row Level Security)

- **`product_families`:** Leitura para todos os autenticados. Escrita apenas para `role = 'teacher'`.
- **`groups`:** Leitura para todos os autenticados. Criação/edição apenas pelo `created_by` do grupo.
- **`group_members`:** Leitura para todos os autenticados (necessário para verificar disponibilidade). Criação/deleção apenas pelo `created_by` do grupo correspondente.
- **`available_students` (view):** Retorna apenas `id` e `full_name`. Acessível por alunos autenticados.

---

## 4. Mecanismo de reserva em tempo real (lock pessimista)

### 4.1 Fluxo de reserva

1. Aluno busca colega no input (mín. 4 letras)
2. Backend retorna alunos disponíveis (via `available_students`)
3. Aluno seleciona um colega -> backend cria `group_members` com `status = 'reserved'` e `reserved_at = now()`
4. A constraint UNIQUE em `student_id` impede reserva duplicada -- se outro aluno tentar reservar o mesmo colega, o INSERT falha
5. No frontend, o erro é tratado com mensagem: "Este colega acabou de ser adicionado a outro grupo"

### 4.2 Liberação de reserva

- **Remoção manual:** Aluno clica no X do chip -> DELETE do `group_members` -> colega volta a ficar disponível
- **Expiração automática:** Após 10 minutos sem finalizar, a reserva é ignorada nas queries (colega reaparece como disponível para outros)
- **Abandono da página:** Se o aluno fecha a aba, as reservas expiram naturalmente após 10 minutos

### 4.3 Finalização

- Ao clicar "Continuar" na etapa 1: grupo muda para `status = 'forming'`
- Ao clicar "Finalizar" na etapa 2: grupo muda para `status = 'complete'`, todas as reservas mudam de `reserved` para `confirmed`
- Após confirmação, os membros ficam permanentemente vinculados ao grupo

---

## 5. Fluxo do usuário

### 5.1 Etapa 1 -- Formar grupo ("Monte seu grupo")

**Tela:**
- `AppHeader` existente (sem navegação de módulos)
- Stepper: "1. Membros" (ativo) -> "2. Detalhes" (inativo)
- Título: "Monte seu grupo"
- Subtítulo: "Adicione seus colegas para formar o grupo de trabalho"
- Input de busca com ícone de lupa, placeholder "Digite o nome do colega (mín. 4 letras)"
- Ao digitar 4+ letras: dropdown com nomes sugeridos (busca por ILIKE no `full_name`)
- Ao selecionar: reserva imediata no backend, colega aparece como chip abaixo
- Chips de membros: avatar + nome. O aluno logado aparece como chip fixo "(você)". Colegas adicionados têm botão X para remover.
- Contador: "Membros do grupo (N/3)" com helper text "Mínimo 2, máximo 3 membros"
- Botão "Continuar" habilitado quando há 2 ou 3 membros (incluindo o próprio aluno)

**Comportamento da busca:**
- Debounce de 300ms após 4o caractere
- Loading spinner no dropdown durante a busca
- Empty state: "Nenhum colega encontrado" se não houver resultados
- Alunos já reservados/confirmados não aparecem nos resultados

### 5.2 Etapa 2 -- Detalhes do grupo ("Detalhes do grupo")

**Tela:**
- `AppHeader` existente (sem navegação de módulos)
- Stepper: "1. Membros" (completo, checkmark) -> "2. Detalhes" (ativo)
- Título: "Detalhes do grupo"
- Subtítulo: "Defina a identidade da sua companhia"
- Seção read-only: chips dos membros do grupo (sem botão de remover)
- Input texto livre: "Nome da companhia" (placeholder: "Ex: Indústrias Aurora")
- Select: "Família de produto" com opções cadastradas pelo professor (mostra **apenas o nome**, sem tipo de tendência)
- Botões: "Voltar" (secondary, volta pra etapa 1) e "Finalizar cadastro" (primary)

**Validação:**
- Nome da companhia: obrigatório, mín. 3 caracteres
- Família de produto: obrigatório, deve selecionar uma opção
- Botão "Finalizar" habilitado apenas quando ambos os campos são válidos

---

## 6. Componentes

### 6.1 Componentes reutilizáveis (`src/components/ui/`)

| Componente | Descrição | Status |
|---|---|---|
| **Stepper** | Indicador de progresso multi-etapa. Props: `steps` (array de labels), `currentStep`, `completedSteps`. Variantes visuais: pendente (cinza), ativo (primary), completo (checkmark). | Novo |
| **SearchInput** | Input com ícone de busca e debounce integrado. Props: `minChars`, `debounceMs`, `onSearch`, `placeholder`. Emite busca apenas após N caracteres. | Novo |
| **Combobox** | Dropdown de busca com estados: loading, vazio, resultados. Props: `items`, `isLoading`, `emptyMessage`, `onSelect`, `renderItem`. Posicionamento automático. | Novo |
| **Chip** | Badge compacto com avatar + texto + ação opcional. Variantes: `removable` (com X) e `readonly`. Props: `label`, `avatar`, `onRemove`, `variant`. | Novo |
| **Select** | Dropdown de seleção simples. Props: `options`, `value`, `onChange`, `placeholder`. | Novo |
| **Badge** | Já existe. Sem alterações necessárias. | Existente |
| **Input** | Já existe. Reusar para "Nome da companhia". | Existente |
| **Button** | Já existe. Reusar para ações do wizard. | Existente |
| **Avatar** | Já existe. Reusar nos chips de membros. | Existente |
| **Card** | Já existe. Possível uso como container do wizard. | Existente |

### 6.2 Componentes específicos (`src/components/`)

| Componente | Descrição |
|---|---|
| **GroupRegistrationWizard** | Orquestra as 2 etapas do wizard. Gerencia estado global (membros, dados do grupo), navegação entre etapas, e redirecionamento ao Dashboard ao finalizar. |
| **GroupMembersStep** | Etapa 1. Integra SearchInput + Combobox para busca de alunos. Faz reservas/liberações no Supabase. Renderiza MemberChipList. Valida mín/máx de membros. |
| **GroupDetailsStep** | Etapa 2. Formulário com Input (nome da companhia) + Select (família de produto). Mostra membros como chips read-only. Valida e submete ao Supabase. |
| **StudentSearchCombobox** | Composição de SearchInput + Combobox com lógica específica: busca na view `available_students`, 4 chars mínimo, tratamento de erro de reserva duplicada. |
| **MemberChipList** | Lista de Chips dos membros. Chip do aluno logado é fixo (sem X). Chips de colegas têm X que dispara liberação de reserva. Mostra contador "N/3". |

---

## 7. Estados de erro

| Cenário | Tratamento |
|---|---|
| Reserva falha (colega já reservado) | Toast/mensagem: "Este colega acabou de ser adicionado a outro grupo. Tente outro." |
| Reservas expiraram ao voltar | Redireciona para etapa 1 limpa com mensagem: "Suas seleções expiraram. Monte seu grupo novamente." |
| Falha de rede ao reservar | Toast de erro genérico com retry. Reserva não é criada. |
| Finalização falha (membro confirmado por outro) | Mensagem explicando conflito, volta pra etapa 1. |

---

## 8. Pré-requisitos (fora do escopo desta feature, mas necessários)

- **Lista de alunos:** Alunos já devem existir como `profiles` no sistema (criados automaticamente via Google OAuth no primeiro login)
- **Famílias de produto:** Professor deve ter uma interface para cadastrar famílias de produto com nome e tipo de tendência. Esta interface **não faz parte deste spec** mas é uma dependência.

---

## 9. Fora do escopo

- Customização de avatar do aluno (mencionado como futuro)
- Interface do professor para cadastro de famílias de produto (dependência separada)
- Interface do professor para gerenciar alunos/turmas
- Edição de grupo após finalização
- Notificações em tempo real para membros do grupo (ex: "Você foi adicionado ao grupo X")
