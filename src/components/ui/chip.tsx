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
