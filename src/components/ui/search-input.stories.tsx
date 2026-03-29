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

export default { title: "UI / SearchInput" }
