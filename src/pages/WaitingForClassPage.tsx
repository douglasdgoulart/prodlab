import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { WaitingForClass } from "@/components/WaitingForClass"

function WaitingForClassPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <WaitingForClass />
      </main>
      <AppFooter />
    </div>
  )
}

export { WaitingForClassPage }
