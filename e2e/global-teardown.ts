import { createClient } from "@supabase/supabase-js"
import { ALL_PRODUCT_FAMILY_IDS, ALL_TEST_EMAILS, ALL_CLASS_IDS } from "./test-ids"

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function globalTeardown() {
  console.log("\n🧹 Global Teardown: cleaning test data...\n")

  // Get test user IDs
  const { data: testProfiles } = await supabase
    .from("profiles")
    .select("id")
    .in("email", ALL_TEST_EMAILS)

  const testUserIds = testProfiles?.map((p) => p.id) ?? []

  if (testUserIds.length > 0) {
    // Delete only groups/members belonging to test users
    await supabase.from("group_members").delete().in("student_id", testUserIds)
    await supabase.from("groups").delete().in("created_by", testUserIds)
    console.log(`  ✓ Groups/members cleaned (${testUserIds.length} test users)`)
  }

  // Delete class memberships for test students
  if (testUserIds.length > 0) {
    await supabase.from("class_members").delete().in("student_id", testUserIds)
  }
  console.log("  ✓ Class memberships cleaned")

  // Delete test classes (by fixed IDs)
  await supabase.from("classes").delete().in("id", ALL_CLASS_IDS)
  console.log(`  ✓ Classes cleaned (${ALL_CLASS_IDS.length} entries)`)

  // Delete only test product families (by fixed IDs)
  await supabase.from("product_families").delete().in("id", ALL_PRODUCT_FAMILY_IDS)
  console.log(`  ✓ Product families cleaned (${ALL_PRODUCT_FAMILY_IDS.length} entries)`)

  console.log("")
}
