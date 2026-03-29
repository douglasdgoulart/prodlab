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
  const [results, setResults] = useState<(AvailableStudent & { label: string })[]>([])
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
        items={results}
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
