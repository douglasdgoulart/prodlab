import { createClient } from "@supabase/supabase-js"
import { PRODUCT_FAMILY_IDS, TEST_EMAILS, ALL_TEST_EMAILS, CLASS_IDS } from "./test-ids"

// Dedicated admin client — never used for verifyOtp
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Separate client for auth user creation
const authClient = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TEST_USERS = [
  { email: TEST_EMAILS.teacher, name: "Professor Teste", role: "teacher" },
  { email: TEST_EMAILS.aluno, name: "Aluno Teste", role: "student" },
  { email: TEST_EMAILS.marina, name: "Marina Silva Costa", role: "student" },
  { email: TEST_EMAILS.joao, name: "João Pedro Lima", role: "student" },
  { email: TEST_EMAILS.mariana, name: "Mariana Oliveira Santos", role: "student" },
  { email: TEST_EMAILS.carlos, name: "Carlos Eduardo Souza", role: "student" },
  { email: TEST_EMAILS.ana, name: "Ana Beatriz Ferreira", role: "student" },
]

const PRODUCT_FAMILIES = [
  { id: PRODUCT_FAMILY_IDS.cerveja, name: "Cerveja Artesanal", trend_type: "seasonal" },
  { id: PRODUCT_FAMILY_IDS.componentes, name: "Componentes Eletrônicos", trend_type: "growth" },
  { id: PRODUCT_FAMILY_IDS.congelados, name: "Alimentos Congelados", trend_type: "stable" },
  { id: PRODUCT_FAMILY_IDS.sorvetes, name: "Sorvetes Premium", trend_type: "seasonal_growth" },
  { id: PRODUCT_FAMILY_IDS.automotivas, name: "Peças Automotivas", trend_type: "decline" },
  { id: PRODUCT_FAMILY_IDS.panetones, name: "Panetones", trend_type: "seasonal_decline" },
]

async function ensureUser(email: string, name: string): Promise<string> {
  const { data, error } = await authClient.auth.admin.createUser({
    email,
    password: "teste12345",
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (data?.user) return data.user.id

  if (error?.message?.includes("already been registered")) {
    const { data: users } = await authClient.auth.admin.listUsers()
    const user = users.users.find((u) => u.email === email)
    if (user) return user.id
  }

  throw new Error(`Failed to ensure user ${email}: ${error?.message}`)
}

export default async function globalSetup() {
  console.log("\n🔧 Global Setup: ensuring test data...\n")

  let teacherId = ""

  // 1. Users + profiles
  for (const user of TEST_USERS) {
    const id = await ensureUser(user.email, user.name)
    await supabase.from("profiles").upsert({ id, email: user.email, full_name: user.name, role: user.role })
    if (user.role === "teacher") teacherId = id
    console.log(`  ✓ ${user.role}: ${user.name}`)
  }

  // 2. Product families (fixed IDs for safe teardown)
  for (const family of PRODUCT_FAMILIES) {
    await supabase.from("product_families").upsert(
      {
        id: family.id,
        name: family.name,
        trend_type: family.trend_type,
        created_by: teacherId,
      },
      { onConflict: "id" }
    )
    console.log(`  ✓ Product Family: ${family.name} (${family.id})`)
  }

  // 3. Classes (fixed IDs for safe teardown)
  await supabase.from("classes").upsert(
    { id: CLASS_IDS.turmaNoturno, name: "Eng. Produção - 2026/1 - Noturno", created_by: teacherId },
    { onConflict: "id" }
  )
  await supabase.from("classes").upsert(
    { id: CLASS_IDS.turmaMatutino, name: "Eng. Produção - 2026/1 - Matutino", created_by: teacherId },
    { onConflict: "id" }
  )
  console.log("  ✓ Classes created")

  // 4. Add all test students to turmaNoturno
  const studentEmails = ALL_TEST_EMAILS.filter((e) => e.includes("@al."))
  for (const email of studentEmails) {
    const studentId = await ensureUser(email, TEST_USERS.find((u) => u.email === email)!.name)
    await supabase.from("class_members").upsert(
      { class_id: CLASS_IDS.turmaNoturno, student_id: studentId },
      { onConflict: "class_id,student_id" }
    )
  }
  console.log("  ✓ Students added to turmaNoturno")

  // 5. Clean groups from previous runs (only test users' groups)
  const { data: testProfiles } = await supabase
    .from("profiles")
    .select("id")
    .in("email", ALL_TEST_EMAILS)

  const testUserIds = testProfiles?.map((p) => p.id) ?? []

  if (testUserIds.length > 0) {
    // Delete members where student is a test user
    await supabase.from("group_members").delete().in("student_id", testUserIds)
    // Delete groups created by test users
    await supabase.from("groups").delete().in("created_by", testUserIds)
  }

  console.log("  ✓ Test groups cleaned\n")
}
