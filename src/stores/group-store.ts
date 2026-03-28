import { create } from "zustand"
import type { AvailableStudent, Group, GroupMember } from "@/types"
import * as groupApi from "@/lib/group-api"

interface MemberWithName extends GroupMember {
  student: AvailableStudent
}

interface GroupState {
  // State
  step: number
  groupId: string | null
  group: Group | null
  members: MemberWithName[]
  companyName: string
  productFamilyId: string
  loading: boolean
  error: string | null

  // Actions
  setStep: (step: number) => void
  setCompanyName: (name: string) => void
  setProductFamilyId: (id: string) => void
  setError: (error: string | null) => void

  // Async actions
  initGroup: (userId: string) => Promise<void>
  loadExistingGroup: (userId: string) => Promise<"complete" | "forming" | "none">
  searchStudents: (query: string) => Promise<AvailableStudent[]>
  addMember: (student: AvailableStudent) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  advanceToStep2: () => Promise<void>
  finalize: () => Promise<void>
  reset: () => void
}

const initialState = {
  step: 0,
  groupId: null,
  group: null,
  members: [],
  companyName: "",
  productFamilyId: "",
  loading: false,
  error: null,
}

export const useGroupStore = create<GroupState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setCompanyName: (companyName) => set({ companyName }),
  setProductFamilyId: (productFamilyId) => set({ productFamilyId }),
  setError: (error) => set({ error }),

  loadExistingGroup: async (userId) => {
    set({ loading: true, error: null })
    try {
      const result = await groupApi.getUserGroup(userId)

      if (!result) {
        set({ loading: false })
        return "none"
      }

      const { group, members } = result

      if (group.status === "complete") {
        set({ group, members, loading: false })
        return "complete"
      }

      // Check if all reservations expired
      const hasValidMembers = members.some(
        (m) =>
          m.status === "confirmed" ||
          (m.status === "reserved" &&
            new Date(m.reserved_at).getTime() > Date.now() - 10 * 60 * 1000)
      )

      if (!hasValidMembers) {
        await groupApi.deleteGroup(group.id)
        set({ loading: false })
        return "none"
      }

      set({
        groupId: group.id,
        group,
        members,
        step: 1, // Go to step 2 (details)
        companyName: group.company_name ?? "",
        productFamilyId: group.product_family_id ?? "",
        loading: false,
      })
      return "forming"
    } catch {
      set({ loading: false, error: "Erro ao carregar grupo" })
      return "none"
    }
  },

  initGroup: async (userId) => {
    set({ loading: true, error: null })
    try {
      const groupId = await groupApi.createGroup(userId)

      const result = await groupApi.getUserGroup(userId)
      set({
        groupId,
        group: result?.group ?? null,
        members: result?.members ?? [],
        step: 0,
        loading: false,
      })
    } catch {
      set({ loading: false, error: "Erro ao criar grupo" })
    }
  },

  searchStudents: async (query) => {
    const { members } = get()
    const excludeIds = members.map((m) => m.student_id)
    return groupApi.searchAvailableStudents(query, excludeIds)
  },

  addMember: async (student) => {
    const { groupId, members } = get()
    if (!groupId) return
    if (members.length >= 3) return

    set({ loading: true, error: null })
    try {
      const member = await groupApi.reserveStudent(groupId, student.id)
      set({
        members: [...members, { ...member, student }],
        loading: false,
      })
    } catch (e) {
      const message =
        e instanceof Error && e.message === "STUDENT_ALREADY_TAKEN"
          ? "Este colega acabou de ser adicionado a outro grupo. Tente outro."
          : "Erro ao adicionar membro"
      set({ loading: false, error: message })
    }
  },

  removeMember: async (memberId) => {
    const { members } = get()
    set({ loading: true, error: null })
    try {
      await groupApi.releaseReservation(memberId)
      set({
        members: members.filter((m) => m.id !== memberId),
        loading: false,
      })
    } catch {
      set({ loading: false, error: "Erro ao remover membro" })
    }
  },

  advanceToStep2: async () => {
    const { groupId } = get()
    if (!groupId) return

    set({ loading: true, error: null })
    try {
      await groupApi.setGroupForming(groupId)
      set({ step: 1, loading: false })
    } catch {
      set({ loading: false, error: "Erro ao avançar" })
    }
  },

  finalize: async () => {
    const { groupId, companyName, productFamilyId } = get()
    if (!groupId) return

    set({ loading: true, error: null })
    try {
      await groupApi.finalizeGroup(groupId, companyName, productFamilyId)
      set({ loading: false })
    } catch {
      set({ loading: false, error: "Erro ao finalizar cadastro" })
    }
  },

  reset: () => set(initialState),
}))
