import { type ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { getUserGroup } from "@/lib/group-api"

interface GroupRouteProps {
  children: ReactNode
}

function GroupRoute({ children }: GroupRouteProps) {
  const { user, isStudent } = useAuth()
  const [status, setStatus] = useState<"loading" | "complete" | "incomplete">(
    "loading"
  )

  useEffect(() => {
    if (!user || !isStudent) return

    getUserGroup(user.id).then((result) => {
      if (result?.group.status === "complete") {
        setStatus("complete")
      } else {
        setStatus("incomplete")
      }
    })
  }, [user, isStudent])

  if (!isStudent) return <>{children}</>

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status === "incomplete") {
    return <Navigate to="/register" replace />
  }

  return <>{children}</>
}

export { GroupRoute }
