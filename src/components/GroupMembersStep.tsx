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
