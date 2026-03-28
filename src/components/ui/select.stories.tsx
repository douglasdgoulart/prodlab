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

export default { title: "UI / Select" }
