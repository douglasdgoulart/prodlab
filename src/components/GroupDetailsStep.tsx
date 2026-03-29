import { useEffect, useState } from "react"
import { useGroupStore } from "@/stores/group-store"
import { useAuth } from "@/hooks/use-auth"
import { MemberChipList } from "./MemberChipList"
import { Input } from "@/components/ui/input"
import { Select, type SelectOption } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { fetchProductFamilies } from "@/lib/group-api"

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
