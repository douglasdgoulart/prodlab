import { supabase } from "./supabase"
import type { AvailableStudent, Group, GroupMember } from "@/types"

/**
 * Search available students by name.
 * Uses a SECURITY DEFINER RPC that verifies caller is student/teacher,
 * filters by ILIKE, and excludes confirmed/reserved students.
 */
export async function searchAvailableStudents(
  query: string,
  excludeIds: string[] = []
): Promise<AvailableStudent[]> {
  const { data, error } = await supabase.rpc("search_available_students", {
    search_query: query,
  })

  if (error) throw error

  const results = (data ?? []) as AvailableStudent[]

  if (excludeIds.length > 0) {
    return results.filter((s) => !excludeIds.includes(s.id))
  }

  return results
}

/**
 * Create a new group and add the creator as the first member (confirmed).
 * Returns the group id.
 */
export async function createGroup(creatorId: string): Promise<string> {
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ created_by: creatorId })
    .select("id")
    .single()

  if (groupError) throw groupError

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      student_id: creatorId,
      status: "confirmed",
    })

  if (memberError) throw memberError

  return group.id
}

/**
 * Reserve a student in a group. The UNIQUE constraint on student_id
 * prevents double-booking — if it fails, the student was taken.
 */
export async function reserveStudent(
  groupId: string,
  studentId: string
): Promise<GroupMember> {
  const { data, error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      student_id: studentId,
      status: "reserved",
      reserved_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("STUDENT_ALREADY_TAKEN")
    }
    throw error
  }

  return data
}

/**
 * Release a reservation (remove student from group).
 */
export async function releaseReservation(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", memberId)

  if (error) throw error
}

/**
 * Finalize step 1: set group status to 'forming'.
 */
export async function setGroupForming(groupId: string): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .update({ status: "forming" })
    .eq("id", groupId)

  if (error) throw error
}

/**
 * Finalize step 2: set company name, product family, confirm all members,
 * and mark group as complete.
 */
export async function finalizeGroup(
  groupId: string,
  companyName: string,
  productFamilyId: string
): Promise<void> {
  const { error: groupError } = await supabase
    .from("groups")
    .update({
      company_name: companyName,
      product_family_id: productFamilyId,
      status: "complete",
    })
    .eq("id", groupId)

  if (groupError) throw groupError

  const { error: memberError } = await supabase
    .from("group_members")
    .update({ status: "confirmed" })
    .eq("group_id", groupId)
    .eq("status", "reserved")

  if (memberError) throw memberError
}

/**
 * Fetch product families for students — only id + name (no trend_type).
 * Uses a SECURITY DEFINER RPC function that bypasses RLS.
 */
export async function fetchProductFamilies(): Promise<
  { id: string; name: string }[]
> {
  const { data, error } = await supabase.rpc("get_student_product_families")

  if (error) throw error
  return data ?? []
}

/**
 * Get the current user's group (if any) with its members.
 * Returns null if the user has no group.
 */
export async function getUserGroup(userId: string): Promise<{
  group: Group
  members: (GroupMember & { student: AvailableStudent })[]
} | null> {
  // Check if user is a member of any group
  const { data: membership, error: memberError } = await supabase
    .from("group_members")
    .select("group_id, status, reserved_at")
    .eq("student_id", userId)
    .single()

  if (memberError || !membership) return null

  // Check if the reservation is expired
  if (membership.status === "reserved") {
    const reservedAt = new Date(membership.reserved_at).getTime()
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000
    if (reservedAt < tenMinutesAgo) {
      return null // expired
    }
  }

  // Get the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", membership.group_id)
    .single()

  if (groupError || !group) return null

  // Get all members with student names
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("*, student:profiles!student_id(id, full_name)")
    .eq("group_id", group.id)

  if (membersError) throw membersError

  return { group, members: members ?? [] }
}

/**
 * Delete a group and all its members (cascades).
 * Used when all reservations have expired.
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)

  if (error) throw error
}
