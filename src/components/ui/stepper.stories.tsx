import type { Story } from "@ladle/react"
import { Stepper } from "./stepper"

const steps = [{ label: "Membros" }, { label: "Detalhes" }]

export const Step1Active: Story = () => (
  <Stepper steps={steps} currentStep={0} />
)

export const Step2Active: Story = () => (
  <Stepper steps={steps} currentStep={1} completedSteps={[0]} />
)

export const AllComplete: Story = () => (
  <Stepper steps={steps} currentStep={1} completedSteps={[0, 1]} />
)

export const ThreeSteps: Story = () => (
  <Stepper
    steps={[{ label: "Membros" }, { label: "Detalhes" }, { label: "Confirmar" }]}
    currentStep={1}
    completedSteps={[0]}
  />
)

export default { title: "UI / Stepper" }
