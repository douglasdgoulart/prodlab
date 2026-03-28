import { type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"

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
 * Clean up all groups from the database (for test isolation).
 */
export async function cleanGroups() {
  await supabase
    .from("group_members")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")

  await supabase
    .from("groups")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")
}
