import { type ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { getUserGroup, getStudentClass } from "@/lib/group-api"

interface GroupRouteProps {
  children: ReactNode
}

function GroupRoute({ children }: GroupRouteProps) {
  const { user, isStudent } = useAuth()
  const [status, setStatus] = useState<
    "loading" | "no-class" | "complete" | "incomplete"
  >("loading")

  useEffect(() => {
    if (!user || !isStudent) return

    async function check() {
      const cls = await getStudentClass(user!.id)
      if (!cls) {
        setStatus("no-class")
        return
      }

      const result = await getUserGroup(user!.id)
      if (result?.group.status === "complete") {
        setStatus("complete")
      } else {
        setStatus("incomplete")
      }
    }

    check()
  }, [user, isStudent])

  if (!isStudent) return <>{children}</>

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status === "no-class") {
    return <Navigate to="/waiting" replace />
  }

  if (status === "incomplete") {
    return <Navigate to="/register" replace />
  }

  return <>{children}</>
}

export { GroupRoute }
