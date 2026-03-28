# UI Components

## Stack

- **Primitivos**: Base UI React (`@base-ui/react`) — componentes headless
- **Variantes**: CVA (`class-variance-authority`) — variantes tipadas via props
- **Estilos**: Tailwind CSS v4 — utility-first, tokens em `src/index.css`
- **Utilitário**: `cn()` de `@/lib/utils` — merge de classes com `clsx` + `tailwind-merge`
- **Ícones**: Lucide React + SVGs inline

## Padrões

### Anatomia de um componente

```tsx
import { cn } from "@/lib/utils"

function Component({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="component"
      className={cn("classes-base", className)}
      {...props}
    />
  )
}

export { Component }
```

Regras:
- Sempre usar `data-slot` para identificação
- Sempre aceitar `className` e mergear com `cn()`
- Export nomeado, nunca default
- Props estendem o tipo do elemento HTML base ou do primitivo Base UI

### Componentes com variantes (CVA)

```tsx
const variants = cva("classes-base", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
})
```

Componentes com CVA: **Button**, **Badge**

### Compound components

Componentes compostos exportam múltiplas funções que se combinam:

```tsx
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
    <CardAction>...</CardAction>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

Componentes compostos: **Card**, **Avatar**, **DropdownMenu**

## Componentes disponíveis

| Componente | Variantes | Sizes | Arquivo |
|---|---|---|---|
| **Button** | default, outline, secondary, ghost, destructive, link | xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg | `button.tsx` |
| **Badge** | default, secondary, destructive, outline, ghost, link | — | `badge.tsx` |
| **Card** | — | default, sm | `card.tsx` |
| **Input** | — | — (estados: disabled, aria-invalid) | `input.tsx` |
| **Avatar** | — | sm, default, lg | `avatar.tsx` |
| **Separator** | — | — (orientação: horizontal, vertical) | `separator.tsx` |
| **DropdownMenu** | item: default, destructive | — | `dropdown-menu.tsx` |

## Design tokens

Definidos em `src/index.css` como CSS custom properties:

- **Cores**: `--primary`, `--accent`, `--destructive`, `--muted`, `--background`, `--foreground`, etc.
- **Chart**: `--chart-1` a `--chart-5` (usados para gráficos)
- **Fontes**: `--font-heading` (Outfit), `--font-body` (Outfit), `--font-mono` (JetBrains Mono), `--font-action` (Space Grotesk)
- **Radius**: `--radius` (0.5rem base), derivados `--radius-sm` a `--radius-4xl`
- **Sombras**: `--shadow-sm`, `--shadow-md`

## Stories (Ladle)

Cada componente tem um arquivo `.stories.tsx` ao lado. Para visualizar:

```bash
npm run stories
```

### Convenção de stories

- Um arquivo por componente: `component.stories.tsx`
- Export `default` com `title: "UI / ComponentName"`
- Export `Variants` mostrando todas as variantes e estados
- Labels com `<p className="text-xs font-mono text-muted-foreground mb-3">`

### Configuração do Ladle

- `.ladle/config.mjs` — busca stories em `src/**/*.stories.tsx`
- `.ladle/ladle.css` — importa Tailwind com `source("../src/")` para scan de classes
- `.ladle/components.tsx` — provider global com CSS do projeto
