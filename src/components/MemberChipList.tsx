import { Chip } from "@/components/ui/chip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "./StudentSearchCombobox"
import type { AvailableStudent, GroupMember } from "@/types"

interface MemberWithName extends GroupMember {
  student: AvailableStudent
}

interface MemberChipListProps {
  members: MemberWithName[]
  currentUserId: string
  onRemove?: (memberId: string) => void
  readonly?: boolean
}

function MemberChipList({
  members,
  currentUserId,
  onRemove,
  readonly = false,
}: MemberChipListProps) {
  return (
    <div data-slot="member-chip-list">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">
          Membros do grupo ({members.length}/3)
        </span>
        <span className="text-xs text-muted-foreground">
          Mínimo 2, máximo 3 membros
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const isCurrentUser = member.student_id === currentUserId
          const name = member.student?.full_name ?? "Sem nome"
          const displayName = isCurrentUser ? `${name} (você)` : name

          return (
            <Chip
              key={member.id}
              label={displayName}
              avatar={
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
              }
              variant={!readonly && !isCurrentUser ? "removable" : "readonly"}
              onRemove={
                !readonly && !isCurrentUser && onRemove
                  ? () => onRemove(member.id)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

export { MemberChipList }
