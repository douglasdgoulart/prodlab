import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ComboboxItem {
  id: string
  label: string
}

interface ComboboxProps<T extends ComboboxItem> extends Omit<React.ComponentProps<"div">, "onSelect"> {
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
