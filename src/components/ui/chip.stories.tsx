import type { Story } from "@ladle/react"
import { Chip } from "./chip"
import { Avatar, AvatarFallback } from "./avatar"

const SmallAvatar = ({ initials }: { initials: string }) => (
  <Avatar size="sm">
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
)

export const Readonly: Story = () => (
  <Chip label="Douglas Oliveira (você)" avatar={<SmallAvatar initials="DO" />} />
)

export const Removable: Story = () => (
  <Chip
    label="João Pedro Lima"
    avatar={<SmallAvatar initials="JP" />}
    variant="removable"
    onRemove={() => alert("Removed!")}
  />
)

export const WithoutAvatar: Story = () => (
  <Chip label="Marina Silva" variant="removable" onRemove={() => {}} />
)

export const ChipGroup: Story = () => (
  <div className="flex flex-wrap gap-2">
    <Chip label="Douglas Oliveira (você)" avatar={<SmallAvatar initials="DO" />} />
    <Chip label="João Pedro Lima" avatar={<SmallAvatar initials="JP" />} variant="removable" onRemove={() => {}} />
    <Chip label="Marina Silva Costa" avatar={<SmallAvatar initials="MS" />} variant="removable" onRemove={() => {}} />
  </div>
)

export default { title: "UI / Chip" }
