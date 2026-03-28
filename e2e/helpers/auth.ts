import { type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { ALL_TEST_EMAILS } from "../test-ids"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Admin client for DB operations (bypasses RLS).
 * NEVER use this client for auth operations — use authClient instead.
 */
export const adminDb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/**
 * Separate client for auth operations (generateLink, verifyOtp).
 * Kept separate so verifyOtp sessions don't contaminate adminDb headers.
 */
function createAuthClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Cache profile IDs
const profileIdCache = new Map<string, string>()

/**
 * Get profile ID by email via auth admin API.
 */
export async function getProfileId(email: string): Promise<string> {
  const cached = profileIdCache.get(email)
  if (cached) return cached

  const { data } = await adminDb.auth.admin.listUsers()
  for (const user of data.users) {
    if (user.email) profileIdCache.set(user.email, user.id)
  }

  const id = profileIdCache.get(email)
  if (!id) throw new Error(`User not found: ${email}`)
  return id
}

/**
 * Inject an authenticated session into the browser's localStorage.
 * Must be called after page.goto() so localStorage is on the correct origin.
 */
export async function injectSession(page: Page, email: string) {
  const authClient = createAuthClient()

  const { data: link } = await authClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  })

  const { data: session } = await authClient.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: "magiclink",
  })

  if (!session.session) throw new Error("Failed to generate session")

  const projectRef = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  const storageKey = `sb-${projectRef}-auth-token`

  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: storageKey, value: session.session }
  )
}

/**
 * Clean up groups for a specific student.
 * Removes their membership AND any groups they created.
 */
export async function cleanGroupsFor(...emails: string[]) {
  const ids = await Promise.all(emails.map(getProfileId))

  // Remove all memberships for these students
  await adminDb.from("group_members").delete().in("student_id", ids)
  // Remove all groups created by these students
  await adminDb.from("groups").delete().in("created_by", ids)
}

/**
 * Clean up groups for ALL test users.
 */
export async function cleanAllTestGroups() {
  const ids = await Promise.all(ALL_TEST_EMAILS.map(getProfileId))

  if (ids.length > 0) {
    await adminDb.from("group_members").delete().in("student_id", ids)
    await adminDb.from("groups").delete().in("created_by", ids)
  }
}

/**
 * Pre-populate a group at step 2 ("forming") in the DB.
 */
export async function seedGroupAtStep2(
  ownerEmail: string,
  partnerEmail: string
): Promise<string> {
  const ownerId = await getProfileId(ownerEmail)
  const partnerId = await getProfileId(partnerEmail)

  await cleanGroupsFor(ownerEmail)
  await adminDb.from("group_members").delete().eq("student_id", partnerId)

  const { data: group, error } = await adminDb
    .from("groups")
    .insert({ created_by: ownerId, status: "forming" })
    .select("id")
    .single()

  if (error || !group) throw new Error(`Failed to create group: ${error?.message}`)

  await adminDb.from("group_members").insert([
    { group_id: group.id, student_id: ownerId, status: "confirmed" },
    { group_id: group.id, student_id: partnerId, status: "confirmed" },
  ])

  return group.id
}

/**
 * Login a student and navigate to /register.
 * Clears any previous session first to avoid cross-test contamination.
 */
export async function loginAndGoToRegister(page: Page, email: string) {
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
  await injectSession(page, email)
  await page.goto("/register")
}
