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

export default { title: "UI / Combobox" }
