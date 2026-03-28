import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGroupStore } from "@/stores/group-store"
import { useAuth } from "@/hooks/use-auth"
import { Stepper } from "@/components/ui/stepper"
import { GroupMembersStep } from "./GroupMembersStep"
import { GroupDetailsStep } from "./GroupDetailsStep"

const WIZARD_STEPS = [{ label: "Membros" }, { label: "Detalhes" }]

function GroupRegistrationWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { step, group, loading, initGroup, loadExistingGroup } =
    useGroupStore()

  useEffect(() => {
    if (!user) return

    async function bootstrap() {
      const status = await loadExistingGroup(user!.id)

      if (status === "complete") {
        navigate("/dashboard", { replace: true })
        return
      }

      if (status === "none") {
        await initGroup(user!.id)
      }
      // "forming" -> store already set step to 1
    }

    bootstrap()
  }, [user, loadExistingGroup, initGroup, navigate])

  // Watch for finalization
  useEffect(() => {
    if (group?.status === "complete") {
      navigate("/dashboard", { replace: true })
    }
  }, [group?.status, navigate])

  if (loading && !group) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  const completedSteps = step > 0 ? [0] : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Stepper
        steps={WIZARD_STEPS}
        currentStep={step}
        completedSteps={completedSteps}
        className="mb-8"
      />

      {step === 0 && <GroupMembersStep />}
      {step === 1 && <GroupDetailsStep />}
    </div>
  )
}

export { GroupRegistrationWizard }
