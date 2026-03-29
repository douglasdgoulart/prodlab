import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperStep {
  label: string
}

interface StepperProps extends React.ComponentProps<"nav"> {
  steps: StepperStep[]
  currentStep: number
  completedSteps?: number[]
}

function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  className,
  ...props
}: StepperProps) {
  return (
    <nav
      data-slot="stepper"
      aria-label="Progresso"
      className={cn("flex items-center justify-center gap-0", className)}
      {...props}
    >
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index)
        const isActive = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={index} className="flex items-center">
            <StepperItem
              label={step.label}
              stepNumber={index + 1}
              isActive={isActive}
              isCompleted={isCompleted}
            />
            {!isLast && <StepperConnector isCompleted={isCompleted} />}
          </div>
        )
      })}
    </nav>
  )
}

function StepperItem({
  label,
  stepNumber,
  isActive,
  isCompleted,
}: {
  label: string
  stepNumber: number
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <div data-slot="stepper-item" className="flex items-center gap-2">
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
          isCompleted && "bg-primary text-primary-foreground",
          isActive && !isCompleted && "bg-primary text-primary-foreground",
          !isActive && !isCompleted && "bg-muted text-muted-foreground"
        )}
      >
        {isCompleted ? <Check className="size-3.5" /> : stepNumber}
      </div>
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap",
          isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}

function StepperConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div
      data-slot="stepper-connector"
      className={cn(
        "mx-3 h-px w-12 transition-colors",
        isCompleted ? "bg-primary" : "bg-border"
      )}
    />
  )
}

export { Stepper, type StepperStep }
