import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { getStudentClass } from "@/lib/group-api"
import { Clock } from "lucide-react"

function WaitingForClass() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (!user) return

    async function checkClass() {
      const cls = await getStudentClass(user!.id)
      if (cls) {
        navigate("/register", { replace: true })
      }
    }

    // Check immediately
    checkClass()

    // Poll every 30 seconds
    intervalRef.current = setInterval(checkClass, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Clock className="size-8 text-muted-foreground" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Quase lá!
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Seu professor ainda não vinculou você a uma turma. Quando isso
        acontecer, você poderá formar seu grupo e começar.
      </p>
      <p className="mt-6 text-xs text-muted-foreground/60">
        Esta página atualiza automaticamente
      </p>
    </div>
  )
}

export { WaitingForClass }
