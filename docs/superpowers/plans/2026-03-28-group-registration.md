# Group Registration Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a 2-step group registration wizard that students must complete before accessing the dashboard, with pessimistic locking to prevent concurrent group formation conflicts.

**Architecture:** Supabase migration creates tables + view + RLS. New Zustand store manages wizard state and Supabase calls. Five new UI primitives (Stepper, Chip, SearchInput, Combobox, Select) compose into domain-specific components (GroupMembersStep, GroupDetailsStep) orchestrated by a GroupRegistrationWizard page. Router gains a new `/register` route with a guard that redirects based on group status.

**Tech Stack:** React 19, TypeScript 5.9, Supabase (Postgres + JS client), Zustand, Tailwind CSS v4, CVA, Base UI React, Lucide React

**Spec:** `docs/superpowers/specs/2026-03-28-group-registration-design.md`

---

## File Structure

### Database
- **Create:** `supabase/migrations/00003_create_group_tables.sql` — product_families, groups, group_members tables + available_students view + RLS policies

### Types
- **Modify:** `src/types/index.ts` — Add ProductFamily, Group, GroupMember, AvailableStudent, GroupStatus, TrendType types

### UI Primitives (`src/components/ui/`)
- **Create:** `src/components/ui/stepper.tsx` — Multi-step progress indicator
- **Create:** `src/components/ui/chip.tsx` — Compact badge with avatar + remove action
- **Create:** `src/components/ui/search-input.tsx` — Input with search icon + debounce + min chars
- **Create:** `src/components/ui/combobox.tsx` — Search dropdown with loading/empty/results states
- **Create:** `src/components/ui/select.tsx` — Simple dropdown select

### Ladle Stories (`src/components/ui/`)
- **Create:** `src/components/ui/stepper.stories.tsx`
- **Create:** `src/components/ui/chip.stories.tsx`
- **Create:** `src/components/ui/search-input.stories.tsx`
- **Create:** `src/components/ui/combobox.stories.tsx`
- **Create:** `src/components/ui/select.stories.tsx`

### Service Layer
- **Create:** `src/lib/group-api.ts` — Supabase queries for group operations (search students, reserve, release, create group, finalize)

### State
- **Create:** `src/stores/group-store.ts` — Zustand store for wizard state (members, group data, step navigation)

### Domain Components (`src/components/`)
- **Create:** `src/components/StudentSearchCombobox.tsx` — Composes SearchInput + Combobox with student search logic
- **Create:** `src/components/MemberChipList.tsx` — List of member Chips with remove + counter
- **Create:** `src/components/GroupMembersStep.tsx` — Step 1: search + reserve students
- **Create:** `src/components/GroupDetailsStep.tsx` — Step 2: company name + product family
- **Create:** `src/components/GroupRegistrationWizard.tsx` — Orchestrates both steps

### Pages & Routing
- **Create:** `src/pages/GroupRegistration.tsx` — Page wrapper with AppHeader/AppFooter + wizard
- **Modify:** `src/app/router.tsx` — Add `/register` route
- **Create:** `src/components/GroupRoute.tsx` — Route guard that checks group status and redirects accordingly
- **Modify:** `src/stores/auth-store.ts` — Add group status check to auth bootstrap
- **Modify:** `src/hooks/use-auth.ts` — Expose group status

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/00003_create_group_tables.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- =============================================
-- Migration: Group registration tables
-- =============================================

-- 1. Product families (teacher-managed)
CREATE TABLE product_families (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  trend_type  text NOT NULL CHECK (trend_type IN (
    'seasonal', 'growth', 'decline', 'stable', 'seasonal_growth', 'seasonal_decline'
  )),
  created_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE product_families ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Authenticated users can read product families"
  ON product_families FOR SELECT
  TO authenticated
  USING (true);

-- Only teachers can insert
CREATE POLICY "Teachers can insert product families"
  ON product_families FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Only the creator teacher can update
CREATE POLICY "Teachers can update own product families"
  ON product_families FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 2. Groups
CREATE TABLE groups (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name       text,
  product_family_id  uuid REFERENCES product_families(id) ON DELETE SET NULL,
  status             text NOT NULL DEFAULT 'forming' CHECK (status IN ('forming', 'complete')),
  created_by         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read groups
CREATE POLICY "Authenticated users can read groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

-- Only the creator can insert
CREATE POLICY "Students can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Only the creator can update
CREATE POLICY "Creator can update own group"
  ON groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- 3. Group members
CREATE TABLE group_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed')),
  reserved_at timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (student_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- All authenticated can read (needed for availability checks)
CREATE POLICY "Authenticated users can read group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

-- Only the group creator can insert members
CREATE POLICY "Group creator can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- Only the group creator can remove members
CREATE POLICY "Group creator can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- Only the group creator can update member status
CREATE POLICY "Group creator can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- 4. View: available students (only id + full_name, no email)
-- Returns students not in any confirmed group and not actively reserved
CREATE OR REPLACE VIEW available_students AS
SELECT
  p.id,
  p.full_name
FROM profiles p
WHERE p.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.student_id = p.id
      AND (
        gm.status = 'confirmed'
        OR (gm.status = 'reserved' AND gm.reserved_at > now() - interval '10 minutes')
      )
  );

-- Grant access to the view for authenticated users
GRANT SELECT ON available_students TO authenticated;
```

- [ ] **Step 2: Verify migration file is valid**

Run: `cat supabase/migrations/00003_create_group_tables.sql | head -5`
Expected: Shows the first lines of the migration

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00003_create_group_tables.sql
git commit -m "feat(db): add group registration tables, RLS and available_students view"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add new types to the types file**

Add after the existing `Profile` interface:

```typescript
export type TrendType =
  | 'seasonal'
  | 'growth'
  | 'decline'
  | 'stable'
  | 'seasonal_growth'
  | 'seasonal_decline';

export type GroupStatus = 'forming' | 'complete';
export type MemberStatus = 'reserved' | 'confirmed';

export interface ProductFamily {
  id: string;
  name: string;
  trend_type: TrendType;
  created_by: string;
  created_at: string;
}

export interface Group {
  id: string;
  company_name: string | null;
  product_family_id: string | null;
  status: GroupStatus;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_id: string;
  status: MemberStatus;
  reserved_at: string;
  created_at: string;
}

export interface AvailableStudent {
  id: string;
  full_name: string | null;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add group registration types"
```

---

## Task 3: UI Component — Stepper

**Files:**
- Create: `src/components/ui/stepper.tsx`
- Create: `src/components/ui/stepper.stories.tsx`

- [ ] **Step 1: Create the Stepper component**

```tsx
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperStep {
  label: string
}

interface StepperProps extends React.ComponentProps<"nav"> {
  steps: StepperStep[]
  currentStep: number
  completedSteps?: number[]
}

function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  className,
  ...props
}: StepperProps) {
  return (
    <nav
      data-slot="stepper"
      aria-label="Progresso"
      className={cn("flex items-center justify-center gap-0", className)}
      {...props}
    >
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index)
        const isActive = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={index} className="flex items-center">
            <StepperItem
              label={step.label}
              stepNumber={index + 1}
              isActive={isActive}
              isCompleted={isCompleted}
            />
            {!isLast && <StepperConnector isCompleted={isCompleted} />}
          </div>
        )
      })}
    </nav>
  )
}

function StepperItem({
  label,
  stepNumber,
  isActive,
  isCompleted,
}: {
  label: string
  stepNumber: number
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <div
      data-slot="stepper-item"
      className="flex items-center gap-2"
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
          isCompleted && "bg-primary text-primary-foreground",
          isActive && !isCompleted && "bg-primary text-primary-foreground",
          !isActive && !isCompleted && "bg-muted text-muted-foreground"
        )}
      >
        {isCompleted ? <Check className="size-3.5" /> : stepNumber}
      </div>
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap",
          isActive || isCompleted
            ? "text-foreground"
            : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}

function StepperConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div
      data-slot="stepper-connector"
      className={cn(
        "mx-3 h-px w-12 transition-colors",
        isCompleted ? "bg-primary" : "bg-border"
      )}
    />
  )
}

export { Stepper, type StepperStep }
```

- [ ] **Step 2: Create Ladle story**

```tsx
import type { Story } from "@ladle/react"
import { Stepper } from "./stepper"

const steps = [
  { label: "Membros" },
  { label: "Detalhes" },
]

export const Step1Active: Story = () => (
  <Stepper steps={steps} currentStep={0} />
)

export const Step2Active: Story = () => (
  <Stepper steps={steps} currentStep={1} completedSteps={[0]} />
)

export const AllComplete: Story = () => (
  <Stepper steps={steps} currentStep={1} completedSteps={[0, 1]} />
)

export const ThreeSteps: Story = () => (
  <Stepper
    steps={[{ label: "Membros" }, { label: "Detalhes" }, { label: "Confirmar" }]}
    currentStep={1}
    completedSteps={[0]}
  />
)

export default {
  title: "UI / Stepper",
}
```

- [ ] **Step 3: Verify story renders**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/stepper.tsx src/components/ui/stepper.stories.tsx
git commit -m "feat(ui): add Stepper component with stories"
```

---

## Task 4: UI Component — Chip

**Files:**
- Create: `src/components/ui/chip.tsx`
- Create: `src/components/ui/chip.stories.tsx`

- [ ] **Step 1: Create the Chip component**

```tsx
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ChipProps extends React.ComponentProps<"div"> {
  label: string
  avatar?: React.ReactNode
  variant?: "removable" | "readonly"
  onRemove?: () => void
}

function Chip({
  label,
  avatar,
  variant = "readonly",
  onRemove,
  className,
  ...props
}: ChipProps) {
  return (
    <div
      data-slot="chip"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-sm text-foreground",
        className
      )}
      {...props}
    >
      {avatar && (
        <span data-slot="chip-avatar" className="shrink-0">
          {avatar}
        </span>
      )}
      <span data-slot="chip-label" className="truncate max-w-[12rem]">
        {label}
      </span>
      {variant === "removable" && onRemove && (
        <button
          type="button"
          data-slot="chip-remove"
          onClick={onRemove}
          className="ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          aria-label={`Remover ${label}`}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

export { Chip }
```

- [ ] **Step 2: Create Ladle story**

```tsx
import type { Story } from "@ladle/react"
import { Chip } from "./chip"
import { Avatar, AvatarFallback } from "./avatar"

const SmallAvatar = ({ initials }: { initials: string }) => (
  <Avatar size="sm">
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
)

export const Readonly: Story = () => (
  <Chip label="Douglas Oliveira (você)" avatar={<SmallAvatar initials="DO" />} />
)

export const Removable: Story = () => (
  <Chip
    label="João Pedro Lima"
    avatar={<SmallAvatar initials="JP" />}
    variant="removable"
    onRemove={() => alert("Removed!")}
  />
)

export const WithoutAvatar: Story = () => (
  <Chip label="Marina Silva" variant="removable" onRemove={() => {}} />
)

export const ChipGroup: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Chip label="Douglas Oliveira (você)" avatar={<SmallAvatar initials="DO" />} />
    <Chip label="João Pedro Lima" avatar={<SmallAvatar initials="JP" />} variant="removable" onRemove={() => {}} />
    <Chip label="Marina Silva Costa" avatar={<SmallAvatar initials="MS" />} variant="removable" onRemove={() => {}} />
  </div>
)

export default {
  title: "UI / Chip",
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/chip.tsx src/components/ui/chip.stories.tsx
git commit -m "feat(ui): add Chip component with stories"
```

---

## Task 5: UI Component — SearchInput

**Files:**
- Create: `src/components/ui/search-input.tsx`
- Create: `src/components/ui/search-input.stories.tsx`

- [ ] **Step 1: Create the SearchInput component**

```tsx
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface SearchInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  minChars?: number
  debounceMs?: number
  onSearch: (query: string) => void
  onClear?: () => void
}

function SearchInput({
  minChars = 4,
  debounceMs = 300,
  onSearch,
  onClear,
  placeholder,
  className,
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)

      if (query.length < minChars) {
        onClear?.()
        return
      }

      timerRef.current = setTimeout(() => {
        onSearch(query)
      }, debounceMs)
    },
    [minChars, debounceMs, onSearch, onClear]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
  }

  return (
    <div data-slot="search-input" className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        )}
        {...props}
      />
    </div>
  )
}

export { SearchInput }
```

- [ ] **Step 2: Create Ladle story**

```tsx
import type { Story } from "@ladle/react"
import { SearchInput } from "./search-input"

export const Default: Story = () => (
  <div className="w-80">
    <SearchInput
      placeholder="Digite o nome do colega (mín. 4 letras)"
      onSearch={(q) => console.log("Searching:", q)}
      onClear={() => console.log("Cleared")}
    />
  </div>
)

export const MinChars3: Story = () => (
  <div className="w-80">
    <SearchInput
      placeholder="Buscar (mín. 3 letras)"
      minChars={3}
      onSearch={(q) => console.log("Searching:", q)}
    />
  </div>
)

export default {
  title: "UI / SearchInput",
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/search-input.tsx src/components/ui/search-input.stories.tsx
git commit -m "feat(ui): add SearchInput component with debounce and stories"
```

---

## Task 6: UI Component — Combobox

**Files:**
- Create: `src/components/ui/combobox.tsx`
- Create: `src/components/ui/combobox.stories.tsx`

- [ ] **Step 1: Create the Combobox component**

```tsx
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ComboboxItem {
  id: string
  label: string
}

interface ComboboxProps<T extends ComboboxItem> extends React.ComponentProps<"div"> {
  items: T[]
  isLoading?: boolean
  isOpen?: boolean
  emptyMessage?: string
  onSelect: (item: T) => void
  renderItem?: (item: T) => React.ReactNode
}

function Combobox<T extends ComboboxItem>({
  items,
  isLoading = false,
  isOpen = false,
  emptyMessage = "Nenhum resultado encontrado",
  onSelect,
  renderItem,
  className,
  ...props
}: ComboboxProps<T>) {
  if (!isOpen) return null

  return (
    <div
      data-slot="combobox"
      className={cn(
        "absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10",
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <ul role="listbox" className="max-h-60 overflow-auto py-1">
          {items.map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={false}
              className="cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() => onSelect(item)}
            >
              {renderItem ? renderItem(item) : item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { Combobox, type ComboboxItem }
```

- [ ] **Step 2: Create Ladle story**

```tsx
import type { Story } from "@ladle/react"
import { Combobox } from "./combobox"

const mockStudents = [
  { id: "1", label: "Marina Silva Costa" },
  { id: "2", label: "Mariana Oliveira Santos" },
  { id: "3", label: "Maria Clara Ferreira" },
]

export const WithResults: Story = () => (
  <div className="relative w-80">
    <Combobox items={mockStudents} isOpen onSelect={(s) => alert(s.label)} />
  </div>
)

export const Loading: Story = () => (
  <div className="relative w-80">
    <Combobox items={[]} isOpen isLoading onSelect={() => {}} />
  </div>
)

export const Empty: Story = () => (
  <div className="relative w-80">
    <Combobox
      items={[]}
      isOpen
      emptyMessage="Nenhum colega encontrado"
      onSelect={() => {}}
    />
  </div>
)

export default {
  title: "UI / Combobox",
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/combobox.tsx src/components/ui/combobox.stories.tsx
git commit -m "feat(ui): add Combobox dropdown component with stories"
```

---

## Task 7: UI Component — Select

**Files:**
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/select.stories.tsx`

- [ ] **Step 1: Create the Select component**

```tsx
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

function Select({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção...",
  className,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      data-slot="select"
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          !selectedOption && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          <ul role="listbox" className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-muted",
                  option.value === value && "bg-muted font-medium"
                )}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export { Select, type SelectOption }
```

- [ ] **Step 2: Create Ladle story**

```tsx
import { useState } from "react"
import type { Story } from "@ladle/react"
import { Select } from "./select"

const productFamilies = [
  { value: "1", label: "Cerveja Artesanal" },
  { value: "2", label: "Componentes Eletrônicos" },
  { value: "3", label: "Alimentos Congelados" },
  { value: "4", label: "Sorvetes Premium" },
]

export const Default: Story = () => {
  const [value, setValue] = useState<string>()
  return (
    <div className="w-80">
      <Select
        options={productFamilies}
        value={value}
        onChange={setValue}
        placeholder="Selecione uma categoria..."
      />
    </div>
  )
}

export const WithSelection: Story = () => (
  <div className="w-80">
    <Select
      options={productFamilies}
      value="2"
      onChange={() => {}}
      placeholder="Selecione..."
    />
  </div>
)

export default {
  title: "UI / Select",
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/select.tsx src/components/ui/select.stories.tsx
git commit -m "feat(ui): add Select dropdown component with stories"
```

---

## Task 8: Supabase Service Layer

**Files:**
- Create: `src/lib/group-api.ts`

- [ ] **Step 1: Create the group API module**

```typescript
import { supabase } from "./supabase"
import type { AvailableStudent, Group, GroupMember, ProductFamily } from "@/types"

/**
 * Search available students by name (ILIKE).
 * Returns only id + full_name. Students already in confirmed groups
 * or with active reservations (< 10 min) are excluded by the view.
 */
export async function searchAvailableStudents(
  query: string,
  excludeIds: string[] = []
): Promise<AvailableStudent[]> {
  let builder = supabase
    .from("available_students")
    .select("id, full_name")
    .ilike("full_name", `%${query}%`)
    .limit(10)

  if (excludeIds.length > 0) {
    builder = builder.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data, error } = await builder

  if (error) throw error
  return data ?? []
}

/**
 * Create a new group and add the creator as the first member.
 * Returns the group id.
 */
export async function createGroup(creatorId: string): Promise<string> {
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ created_by: creatorId })
    .select("id")
    .single()

  if (groupError) throw groupError

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      student_id: creatorId,
      status: "confirmed",
    })

  if (memberError) throw memberError

  return group.id
}

/**
 * Reserve a student in a group. The UNIQUE constraint on student_id
 * prevents double-booking — if it fails, the student was taken.
 */
export async function reserveStudent(
  groupId: string,
  studentId: string
): Promise<GroupMember> {
  const { data, error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      student_id: studentId,
      status: "reserved",
      reserved_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("STUDENT_ALREADY_TAKEN")
    }
    throw error
  }

  return data
}

/**
 * Release a reservation (remove student from group).
 */
export async function releaseReservation(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", memberId)

  if (error) throw error
}

/**
 * Finalize step 1: set group status to 'forming'.
 */
export async function setGroupForming(groupId: string): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .update({ status: "forming" })
    .eq("id", groupId)

  if (error) throw error
}

/**
 * Finalize step 2: set company name, product family, confirm all members,
 * and mark group as complete.
 */
export async function finalizeGroup(
  groupId: string,
  companyName: string,
  productFamilyId: string
): Promise<void> {
  // Update group details + status
  const { error: groupError } = await supabase
    .from("groups")
    .update({
      company_name: companyName,
      product_family_id: productFamilyId,
      status: "complete",
    })
    .eq("id", groupId)

  if (groupError) throw groupError

  // Confirm all reserved members
  const { error: memberError } = await supabase
    .from("group_members")
    .update({ status: "confirmed" })
    .eq("group_id", groupId)
    .eq("status", "reserved")

  if (memberError) throw memberError
}

/**
 * Fetch product families (name only — trend_type is hidden from students).
 */
export async function fetchProductFamilies(): Promise<
  Pick<ProductFamily, "id" | "name">[]
> {
  const { data, error } = await supabase
    .from("product_families")
    .select("id, name")
    .order("name")

  if (error) throw error
  return data ?? []
}

/**
 * Get the current user's group (if any) with its members.
 * Returns null if the user has no group.
 */
export async function getUserGroup(userId: string): Promise<{
  group: Group
  members: (GroupMember & { student: AvailableStudent })[]
} | null> {
  // Check if user is a member of any group
  const { data: membership, error: memberError } = await supabase
    .from("group_members")
    .select("group_id, status, reserved_at")
    .eq("student_id", userId)
    .single()

  if (memberError || !membership) return null

  // Check if the reservation is expired
  if (membership.status === "reserved") {
    const reservedAt = new Date(membership.reserved_at).getTime()
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000
    if (reservedAt < tenMinutesAgo) {
      return null // expired
    }
  }

  // Get the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", membership.group_id)
    .single()

  if (groupError || !group) return null

  // Get all members with student names
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("*, student:profiles!student_id(id, full_name)")
    .eq("group_id", group.id)

  if (membersError) throw membersError

  return { group, members: members ?? [] }
}

/**
 * Delete a group and all its members (cascades).
 * Used when all reservations have expired.
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)

  if (error) throw error
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/group-api.ts
git commit -m "feat(api): add Supabase service layer for group operations"
```

---

## Task 9: Group Registration Zustand Store

**Files:**
- Create: `src/stores/group-store.ts`

- [ ] **Step 1: Create the store**

```typescript
import { create } from "zustand"
import type { AvailableStudent, Group, GroupMember } from "@/types"
import * as groupApi from "@/lib/group-api"

interface MemberWithName extends GroupMember {
  student: AvailableStudent
}

interface GroupState {
  // State
  step: number
  groupId: string | null
  group: Group | null
  members: MemberWithName[]
  companyName: string
  productFamilyId: string
  loading: boolean
  error: string | null

  // Actions
  setStep: (step: number) => void
  setCompanyName: (name: string) => void
  setProductFamilyId: (id: string) => void
  setError: (error: string | null) => void

  // Async actions
  initGroup: (userId: string) => Promise<void>
  loadExistingGroup: (userId: string) => Promise<"complete" | "forming" | "none">
  searchStudents: (query: string) => Promise<AvailableStudent[]>
  addMember: (student: AvailableStudent) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  advanceToStep2: () => Promise<void>
  finalize: () => Promise<void>
  reset: () => void
}

const initialState = {
  step: 0,
  groupId: null,
  group: null,
  members: [],
  companyName: "",
  productFamilyId: "",
  loading: false,
  error: null,
}

export const useGroupStore = create<GroupState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setCompanyName: (companyName) => set({ companyName }),
  setProductFamilyId: (productFamilyId) => set({ productFamilyId }),
  setError: (error) => set({ error }),

  loadExistingGroup: async (userId) => {
    set({ loading: true, error: null })
    try {
      const result = await groupApi.getUserGroup(userId)

      if (!result) {
        set({ loading: false })
        return "none"
      }

      const { group, members } = result

      if (group.status === "complete") {
        set({ group, members, loading: false })
        return "complete"
      }

      // Check if all reservations expired
      const hasValidMembers = members.some(
        (m) =>
          m.status === "confirmed" ||
          (m.status === "reserved" &&
            new Date(m.reserved_at).getTime() > Date.now() - 10 * 60 * 1000)
      )

      if (!hasValidMembers) {
        await groupApi.deleteGroup(group.id)
        set({ loading: false })
        return "none"
      }

      set({
        groupId: group.id,
        group,
        members,
        step: 1, // Go to step 2 (details)
        companyName: group.company_name ?? "",
        productFamilyId: group.product_family_id ?? "",
        loading: false,
      })
      return "forming"
    } catch {
      set({ loading: false, error: "Erro ao carregar grupo" })
      return "none"
    }
  },

  initGroup: async (userId) => {
    set({ loading: true, error: null })
    try {
      const groupId = await groupApi.createGroup(userId)

      // The creator is auto-added as confirmed member
      const result = await groupApi.getUserGroup(userId)
      set({
        groupId,
        group: result?.group ?? null,
        members: result?.members ?? [],
        step: 0,
        loading: false,
      })
    } catch {
      set({ loading: false, error: "Erro ao criar grupo" })
    }
  },

  searchStudents: async (query) => {
    const { members } = get()
    const excludeIds = members.map((m) => m.student_id)
    return groupApi.searchAvailableStudents(query, excludeIds)
  },

  addMember: async (student) => {
    const { groupId, members } = get()
    if (!groupId) return
    if (members.length >= 3) return

    set({ loading: true, error: null })
    try {
      const member = await groupApi.reserveStudent(groupId, student.id)
      set({
        members: [...members, { ...member, student }],
        loading: false,
      })
    } catch (e) {
      const message =
        e instanceof Error && e.message === "STUDENT_ALREADY_TAKEN"
          ? "Este colega acabou de ser adicionado a outro grupo. Tente outro."
          : "Erro ao adicionar membro"
      set({ loading: false, error: message })
    }
  },

  removeMember: async (memberId) => {
    const { members } = get()
    set({ loading: true, error: null })
    try {
      await groupApi.releaseReservation(memberId)
      set({
        members: members.filter((m) => m.id !== memberId),
        loading: false,
      })
    } catch {
      set({ loading: false, error: "Erro ao remover membro" })
    }
  },

  advanceToStep2: async () => {
    const { groupId } = get()
    if (!groupId) return

    set({ loading: true, error: null })
    try {
      await groupApi.setGroupForming(groupId)
      set({ step: 1, loading: false })
    } catch {
      set({ loading: false, error: "Erro ao avançar" })
    }
  },

  finalize: async () => {
    const { groupId, companyName, productFamilyId } = get()
    if (!groupId) return

    set({ loading: true, error: null })
    try {
      await groupApi.finalizeGroup(groupId, companyName, productFamilyId)
      set({ loading: false })
    } catch {
      set({ loading: false, error: "Erro ao finalizar cadastro" })
    }
  },

  reset: () => set(initialState),
}))
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/stores/group-store.ts
git commit -m "feat(store): add Zustand store for group registration wizard"
```

---

## Task 10: Domain Components — StudentSearchCombobox & MemberChipList

**Files:**
- Create: `src/components/StudentSearchCombobox.tsx`
- Create: `src/components/MemberChipList.tsx`

- [ ] **Step 1: Create StudentSearchCombobox**

```tsx
import { useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import { Combobox } from "@/components/ui/combobox"
import type { AvailableStudent } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StudentSearchComboboxProps {
  onSelect: (student: AvailableStudent) => void
  onSearch: (query: string) => Promise<AvailableStudent[]>
  disabled?: boolean
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function StudentSearchCombobox({
  onSelect,
  onSearch,
  disabled,
}: StudentSearchComboboxProps) {
  const [results, setResults] = useState<AvailableStudent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSearch(query: string) {
    setIsLoading(true)
    setIsOpen(true)
    try {
      const students = await onSearch(query)
      setResults(
        students.map((s) => ({ ...s, label: s.full_name ?? "Sem nome" }))
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleClear() {
    setResults([])
    setIsOpen(false)
  }

  function handleSelect(item: AvailableStudent & { label: string }) {
    onSelect(item)
    setIsOpen(false)
    setResults([])
  }

  return (
    <div className="relative">
      <SearchInput
        placeholder="Digite o nome do colega (mín. 4 letras)"
        minChars={4}
        debounceMs={300}
        onSearch={handleSearch}
        onClear={handleClear}
        disabled={disabled}
      />
      <Combobox
        items={results.map((s) => ({
          id: s.id,
          label: s.full_name ?? "Sem nome",
          ...s,
        }))}
        isOpen={isOpen}
        isLoading={isLoading}
        emptyMessage="Nenhum colega encontrado"
        onSelect={handleSelect}
        renderItem={(item) => (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>
                {getInitials(item.label)}
              </AvatarFallback>
            </Avatar>
            <span>{item.label}</span>
          </div>
        )}
      />
    </div>
  )
}

export { StudentSearchCombobox, getInitials }
```

- [ ] **Step 2: Create MemberChipList**

```tsx
import { Chip } from "@/components/ui/chip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "./StudentSearchCombobox"
import type { AvailableStudent, GroupMember } from "@/types"

interface MemberWithName extends GroupMember {
  student: AvailableStudent
}

interface MemberChipListProps {
  members: MemberWithName[]
  currentUserId: string
  onRemove?: (memberId: string) => void
  readonly?: boolean
}

function MemberChipList({
  members,
  currentUserId,
  onRemove,
  readonly = false,
}: MemberChipListProps) {
  return (
    <div data-slot="member-chip-list">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">
          Membros do grupo ({members.length}/3)
        </span>
        <span className="text-xs text-muted-foreground">
          Mínimo 2, máximo 3 membros
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const isCurrentUser = member.student_id === currentUserId
          const name = member.student?.full_name ?? "Sem nome"
          const displayName = isCurrentUser ? `${name} (você)` : name

          return (
            <Chip
              key={member.id}
              label={displayName}
              avatar={
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
              }
              variant={!readonly && !isCurrentUser ? "removable" : "readonly"}
              onRemove={
                !readonly && !isCurrentUser && onRemove
                  ? () => onRemove(member.id)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

export { MemberChipList }
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/StudentSearchCombobox.tsx src/components/MemberChipList.tsx
git commit -m "feat: add StudentSearchCombobox and MemberChipList components"
```

---

## Task 11: Domain Components — GroupMembersStep

**Files:**
- Create: `src/components/GroupMembersStep.tsx`

- [ ] **Step 1: Create the step 1 component**

```tsx
import { useGroupStore } from "@/stores/group-store"
import { useAuth } from "@/hooks/use-auth"
import { StudentSearchCombobox } from "./StudentSearchCombobox"
import { MemberChipList } from "./MemberChipList"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

function GroupMembersStep() {
  const { user } = useAuth()
  const {
    members,
    loading,
    error,
    searchStudents,
    addMember,
    removeMember,
    advanceToStep2,
    setError,
  } = useGroupStore()

  const canContinue = members.length >= 2 && members.length <= 3

  async function handleContinue() {
    await advanceToStep2()
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Monte seu grupo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione seus colegas para formar o grupo de trabalho
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Pesquisar alunos
        </label>
        <StudentSearchCombobox
          onSearch={searchStudents}
          onSelect={(student) => {
            setError(null)
            addMember(student)
          }}
          disabled={members.length >= 3}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <MemberChipList
        members={members}
        currentUserId={user?.id ?? ""}
        onRemove={removeMember}
      />

      <Button
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="w-full"
        size="lg"
      >
        Continuar
        <ArrowRight data-icon="inline-end" className="size-4" />
      </Button>
    </div>
  )
}

export { GroupMembersStep }
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/GroupMembersStep.tsx
git commit -m "feat: add GroupMembersStep (wizard step 1)"
```

---

## Task 12: Domain Components — GroupDetailsStep

**Files:**
- Create: `src/components/GroupDetailsStep.tsx`

- [ ] **Step 1: Create the step 2 component**

```tsx
import { useEffect, useState } from "react"
import { useGroupStore } from "@/stores/group-store"
import { useAuth } from "@/hooks/use-auth"
import { MemberChipList } from "./MemberChipList"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { fetchProductFamilies } from "@/lib/group-api"
import type { SelectOption } from "@/components/ui/select"

function GroupDetailsStep() {
  const { user } = useAuth()
  const {
    members,
    companyName,
    productFamilyId,
    loading,
    error,
    setCompanyName,
    setProductFamilyId,
    setStep,
    finalize,
  } = useGroupStore()

  const [familyOptions, setFamilyOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    fetchProductFamilies().then((families) => {
      setFamilyOptions(
        families.map((f) => ({ value: f.id, label: f.name }))
      )
    })
  }, [])

  const isValid = companyName.trim().length >= 3 && productFamilyId !== ""

  async function handleFinalize() {
    await finalize()
    // Navigation handled by parent (wizard) after store updates
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Detalhes do grupo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina a identidade da sua companhia
        </p>
      </div>

      <MemberChipList
        members={members}
        currentUserId={user?.id ?? ""}
        readonly
      />

      <div className="space-y-4">
        <div>
          <label
            htmlFor="company-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Nome da companhia
          </label>
          <Input
            id="company-name"
            placeholder="Ex: Indústrias Aurora"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Família de produto
          </label>
          <Select
            options={familyOptions}
            value={productFamilyId}
            onChange={setProductFamilyId}
            placeholder="Selecione uma categoria..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep(0)}
          disabled={loading}
          className="flex-1"
          size="lg"
        >
          <ArrowLeft data-icon="inline-start" className="size-4" />
          Voltar
        </Button>
        <Button
          onClick={handleFinalize}
          disabled={!isValid || loading}
          className="flex-1"
          size="lg"
        >
          Finalizar cadastro
        </Button>
      </div>
    </div>
  )
}

export { GroupDetailsStep }
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/GroupDetailsStep.tsx
git commit -m "feat: add GroupDetailsStep (wizard step 2)"
```

---

## Task 13: GroupRegistrationWizard + Page

**Files:**
- Create: `src/components/GroupRegistrationWizard.tsx`
- Create: `src/pages/GroupRegistration.tsx`

- [ ] **Step 1: Create the wizard orchestrator**

```tsx
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGroupStore } from "@/stores/group-store"
import { useAuth } from "@/hooks/use-auth"
import { Stepper } from "@/components/ui/stepper"
import { GroupMembersStep } from "./GroupMembersStep"
import { GroupDetailsStep } from "./GroupDetailsStep"

const WIZARD_STEPS = [{ label: "Membros" }, { label: "Detalhes" }]

function GroupRegistrationWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { step, group, loading, initGroup, loadExistingGroup } =
    useGroupStore()

  useEffect(() => {
    if (!user) return

    async function bootstrap() {
      const status = await loadExistingGroup(user!.id)

      if (status === "complete") {
        navigate("/dashboard", { replace: true })
        return
      }

      if (status === "none") {
        await initGroup(user!.id)
      }
      // "forming" -> store already set step to 1
    }

    bootstrap()
  }, [user, loadExistingGroup, initGroup, navigate])

  // Watch for finalization
  useEffect(() => {
    if (group?.status === "complete") {
      navigate("/dashboard", { replace: true })
    }
  }, [group?.status, navigate])

  if (loading && !group) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  const completedSteps = step > 0 ? [0] : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Stepper
        steps={WIZARD_STEPS}
        currentStep={step}
        completedSteps={completedSteps}
        className="mb-8"
      />

      {step === 0 && <GroupMembersStep />}
      {step === 1 && <GroupDetailsStep />}
    </div>
  )
}

export { GroupRegistrationWizard }
```

- [ ] **Step 2: Create the page wrapper**

```tsx
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { GroupRegistrationWizard } from "@/components/GroupRegistrationWizard"

function GroupRegistration() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <GroupRegistrationWizard />
      </main>
      <AppFooter />
    </div>
  )
}

export { GroupRegistration }
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/GroupRegistrationWizard.tsx src/pages/GroupRegistration.tsx
git commit -m "feat: add GroupRegistrationWizard and GroupRegistration page"
```

---

## Task 14: Routing & Auth Integration

**Files:**
- Create: `src/components/GroupRoute.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/stores/auth-store.ts`
- Modify: `src/hooks/use-auth.ts`

- [ ] **Step 1: Create the GroupRoute guard**

This guard wraps the Dashboard route. It checks if the student has a completed group — if not, redirects to `/register`.

```tsx
import { type ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { getUserGroup } from "@/lib/group-api"

interface GroupRouteProps {
  children: ReactNode
}

function GroupRoute({ children }: GroupRouteProps) {
  const { user, isStudent } = useAuth()
  const [status, setStatus] = useState<"loading" | "complete" | "incomplete">(
    "loading"
  )

  useEffect(() => {
    if (!user || !isStudent) return

    getUserGroup(user.id).then((result) => {
      if (result?.group.status === "complete") {
        setStatus("complete")
      } else {
        setStatus("incomplete")
      }
    })
  }, [user, isStudent])

  if (!isStudent) return <>{children}</>

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status === "incomplete") {
    return <Navigate to="/register" replace />
  }

  return <>{children}</>
}

export { GroupRoute }
```

- [ ] **Step 2: Update router.tsx**

Add the `/register` route and wrap Dashboard with GroupRoute. The new router should look like this (full file):

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthCallback } from '../pages/AuthCallback';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { Unauthorized } from '../pages/Unauthorized';
import { GroupRegistration } from '../pages/GroupRegistration';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';
import { GroupRoute } from '../components/GroupRoute';

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
    path: '/register',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <GroupRegistration />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <GroupRoute>
            <Dashboard />
          </GroupRoute>
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

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`

Test the following flows:
1. Login as student with no group → should redirect to `/register`
2. Step 1: search for student (type 4+ chars), select from dropdown, see chip appear
3. Step 1: remove a member via X button
4. Step 1: click "Continuar" with 2-3 members → advance to step 2
5. Step 2: fill company name, select product family, click "Finalizar"
6. Should redirect to `/dashboard`
7. Refresh page → should go directly to `/dashboard` (group already complete)

- [ ] **Step 5: Commit**

```bash
git add src/components/GroupRoute.tsx src/app/router.tsx
git commit -m "feat: add /register route with GroupRoute guard for dashboard"
```

---

## Task 15: Push Migration to Supabase

**Files:**
- Uses: `supabase/migrations/00003_create_group_tables.sql`

- [ ] **Step 1: Push migration to remote Supabase**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 2: Seed test data — product families**

Insert a few product families via Supabase dashboard or SQL editor for testing:

```sql
-- Run this in the Supabase SQL Editor (replace <teacher-uuid> with an actual teacher profile id)
INSERT INTO product_families (name, trend_type, created_by) VALUES
  ('Cerveja Artesanal', 'seasonal', '<teacher-uuid>'),
  ('Componentes Eletrônicos', 'growth', '<teacher-uuid>'),
  ('Alimentos Congelados', 'stable', '<teacher-uuid>'),
  ('Sorvetes Premium', 'seasonal_growth', '<teacher-uuid>');
```

- [ ] **Step 3: Verify tables exist**

Run in SQL Editor: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
Expected: Should list `groups`, `group_members`, `product_families`, `profiles`

- [ ] **Step 4: Verify view exists**

Run in SQL Editor: `SELECT * FROM available_students LIMIT 5;`
Expected: Returns student rows with only `id` and `full_name` columns

---

## Spec Coverage Check

| Spec Section | Task(s) |
|---|---|
| 1. Visão geral | All tasks collectively |
| 2. Roteamento de entrada | Task 14 (GroupRoute + router) |
| 3.1 product_families | Task 1 |
| 3.2 groups | Task 1 |
| 3.3 group_members | Task 1 |
| 3.4 available_students view | Task 1 |
| 3.5 RLS | Task 1 |
| 4.1 Fluxo de reserva | Task 8 (group-api) + Task 9 (store) |
| 4.2 Liberação de reserva | Task 8 + Task 10 (MemberChipList) |
| 4.3 Finalização | Task 8 + Task 12 (GroupDetailsStep) |
| 5.1 Etapa 1 UI | Tasks 3-6 (UI) + Task 10-11 (domain) |
| 5.2 Etapa 2 UI | Task 7 (Select) + Task 12 (GroupDetailsStep) |
| 6.1 UI Components | Tasks 3-7 |
| 6.2 Domain Components | Tasks 10-13 |
| 7. Estados de erro | Task 9 (store error handling) + Task 11-12 (UI error display) |
| 8. Pré-requisitos | Task 15 (seed data) |
