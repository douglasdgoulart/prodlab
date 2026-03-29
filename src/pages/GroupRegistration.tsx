import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { GroupRegistrationWizard } from "@/components/GroupRegistrationWizard"

function GroupRegistration() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <GroupRegistrationWizard />
      </main>
      <AppFooter />
    </div>
  )
}

export { GroupRegistration }
