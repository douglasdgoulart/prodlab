# Conceito de Turma (Classes)

**Data:** 2026-03-28
**Branch:** `feature/completar-cadastro`

### Referências visuais (Stitch)

| Tela | Screen ID | Screenshot |
|------|-----------|------------|
| Aguardando Turma | `b45bf4258e0d4026990a261c78c62635` | [screenshot](https://lh3.googleusercontent.com/aida/ADBb0uheyzCKT8by90s3Rn3iziMnBxUlmPmUDNcRVIxy2JGY0yN8lZLZXKaorCDJEfLkWYg2ZU6smyDOKpq_2pJGBK39fYizs0CCYAJfHL8YLSNt90ATLRbl0E9Yavl44yA1WGjLqbTLqZLKjVJ4_g0kmaC9f11pGs-Utjqp0W98vAz8X96m6kjK3ZqCYKSHv1WE2qaDB0YCugAsd-hsfYGcHXw5wJkFCgUCmOv8CohUnFtbMN-VO8brjBBg9m08) |

> **Nota:** Ignorar header/footer e card de MRPII do mockup Stitch. Usar AppHeader/AppFooter reais. Tela deve conter apenas a mensagem centralizada sem cards explicativos.

---

## 1. Visão geral

Adiciona o conceito de **turma** ao ProdLab. Cada turma é criada por um professor e contém um conjunto de alunos. Grupos são formados dentro de uma turma -- o aluno só vê e busca colegas da mesma turma.

**Regras:**
- Professor cria turmas e adiciona alunos a elas
- Um aluno pode pertencer a mais de uma turma (modelo N:N), mas por ora só terá 1 turma na prática
- Aluno sem turma vê uma tela de espera ("Quase lá!")
- Aluno com turma segue o fluxo normal do wizard (Membros → Detalhes)
- A turma é resolvida automaticamente (sem tela de seleção)
- Famílias de produto continuam globais, sem vínculo com turma

---

## 2. Modelo de dados

### 2.1 Nova tabela: `classes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid, PK, DEFAULT gen_random_uuid() | Identificador |
| `name` | text, NOT NULL | Ex: "Eng. Produção - 2026/1 - Noturno" |
| `created_by` | uuid, FK -> profiles, NOT NULL | Professor que criou |
| `created_at` | timestamptz, DEFAULT now() | Auto |

### 2.2 Nova tabela: `class_members`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid, PK, DEFAULT gen_random_uuid() | Identificador |
| `class_id` | uuid, FK -> classes, NOT NULL | Turma |
| `student_id` | uuid, FK -> profiles, NOT NULL | Aluno |
| `created_at` | timestamptz, DEFAULT now() | Auto |
| UNIQUE | (class_id, student_id) | Aluno não duplica na mesma turma |

### 2.3 Alteração na tabela `groups`

Nova coluna:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `class_id` | uuid, FK -> classes, NOT NULL | Turma onde o grupo foi formado |

**Nota:** Grupos existentes (se houver) precisam de migração. Como o sistema ainda está em desenvolvimento, os grupos existentes podem ser deletados na migration.

### 2.4 Tabelas inalteradas

- `product_families` -- continua global
- `profiles` -- sem alteração
- `group_members` -- sem alteração

---

## 3. RLS (Row Level Security)

### `classes`

- **SELECT:** Todos os autenticados com role `student` ou `teacher` podem ler
- **INSERT:** Apenas `role = 'teacher'`
- **UPDATE:** Apenas o professor criador (`created_by = auth.uid()`)

### `class_members`

- **SELECT:** Todos os autenticados com role `student` ou `teacher`
- **INSERT:** Apenas se o caller é o `created_by` da turma correspondente (professor dono da turma)
- **DELETE:** Apenas se o caller é o `created_by` da turma correspondente

### Alterações nas policies existentes

**`groups`:** INSERT policy deve verificar que o `class_id` fornecido é uma turma à qual o aluno pertence:
```
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM class_members
    WHERE class_id = groups.class_id
      AND student_id = auth.uid()
  )
)
```

**`group_members`:** Sem alteração (já verifica `created_by` do grupo).

---

## 4. Alteração na RPC `search_available_students`

Novo parâmetro: `p_class_id uuid`.

A função filtra alunos que:
1. Pertencem à turma (`class_members.class_id = p_class_id`)
2. Têm `role = 'student'`
3. **Não** estão em grupo confirmado
4. **Não** estão em reserva ativa (< 10 min)
5. Nome faz match com `search_query` via ILIKE

Verifica que o caller é student ou teacher (mantém verificação existente).

---

## 5. Roteamento de entrada (atualizado)

```
Login -> OAuth callback -> Verifica perfil
  |-- role = 'denied'? -> /unauthorized
  |-- role = 'teacher'? -> /admin
  |-- role = 'student':
      |-- Não tem nenhuma turma (class_members)? -> /waiting (tela "Quase lá!")
      |-- Tem turma + grupo completo? -> /dashboard
      |-- Tem turma + grupo forming? -> /register (wizard etapa 2)
      |-- Tem turma + sem grupo? -> /register (wizard etapa 1)
```

A turma é resolvida automaticamente: pega a primeira (e por ora única) turma do aluno via `class_members`.

---

## 6. Nova tela: "Quase lá!" (`/waiting`)

Tela simples com AppHeader e AppFooter (sem navegação de módulos).

Conteúdo centralizado:
- Ícone sutil (relógio ou ampulheta) em tons muted
- Título: **"Quase lá!"** (Outfit bold, large)
- Texto: "Seu professor ainda não vinculou você a uma turma. Quando isso acontecer, você poderá formar seu grupo e começar."
- Texto muted pequeno: "Esta página atualiza automaticamente"

A página faz polling a cada 30 segundos verificando se o aluno foi adicionado a alguma turma. Quando detecta, redireciona para `/register`.

---

## 7. Alterações no wizard de cadastro de grupo

### `GroupRegistrationWizard`

- No bootstrap, busca a turma do aluno via `class_members`
- Se não tem turma, redireciona para `/waiting`
- Passa `class_id` para o store e para `createGroup`

### `createGroup` (group-api.ts)

- Recebe `classId` como parâmetro
- Insere grupo com `class_id`

### `searchStudents` (group-store.ts)

- Passa `class_id` para a RPC `search_available_students`

### `GroupRoute`

- Além de verificar grupo completo, verifica se aluno tem turma
- Sem turma → `/waiting`

---

## 8. Componentes

### Novos

| Componente | Descrição |
|---|---|
| **WaitingForClass** | Página `/waiting` com mensagem + polling |

### Alterados

| Componente | Alteração |
|---|---|
| **GroupRegistrationWizard** | Busca `class_id` no bootstrap, passa para store |
| **GroupRoute** | Verifica turma além de grupo |

### Inalterados

Todos os componentes UI (Stepper, Chip, SearchInput, Combobox, Select) e os domain components (GroupMembersStep, GroupDetailsStep, MemberChipList, StudentSearchCombobox) ficam inalterados. A turma é transparente para eles -- só muda o que a RPC retorna.

---

## 9. Service layer (group-api.ts)

### Novas funções

- `getStudentClass(userId)` -- retorna a primeira turma do aluno ou null
- `createGroup(creatorId, classId)` -- atualizado para incluir `class_id`

### Funções alteradas

- `searchAvailableStudents(query, excludeIds)` → `searchAvailableStudents(query, classId, excludeIds)` -- passa `p_class_id` para a RPC

### Funções inalteradas

Todas as demais (reserveStudent, releaseReservation, setGroupForming, finalizeGroup, fetchProductFamilies, getUserGroup, deleteGroup).

---

## 10. Fora do escopo

- Interface do professor para criar turmas e adicionar alunos (dependência separada -- por ora via SQL/Dashboard)
- Seleção de turma quando aluno tem N turmas (futuro)
- Tela de edição de turma
- Vinculação de famílias de produto a turmas
