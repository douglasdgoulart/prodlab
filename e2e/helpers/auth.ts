import { type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { ALL_TEST_EMAILS } from "../test-ids"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/**
 * Generate a fresh session for a user and inject it into the browser's localStorage.
 * Must be called after page.goto() so localStorage is on the correct origin.
 */
export async function injectSession(page: Page, email: string) {
  const { data: link } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  })

  const { data: session } = await supabase.auth.verifyOtp({
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
 * Clean up groups belonging to test users only (safe for shared DBs).
 */
export async function cleanGroups() {
  const { data: testProfiles } = await supabase
    .from("profiles")
    .select("id")
    .in("email", ALL_TEST_EMAILS)

  const testUserIds = testProfiles?.map((p) => p.id) ?? []

  if (testUserIds.length > 0) {
    await supabase.from("group_members").delete().in("student_id", testUserIds)
    await supabase.from("groups").delete().in("created_by", testUserIds)
  }
}
