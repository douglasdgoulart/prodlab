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
