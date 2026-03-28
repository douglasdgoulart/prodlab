import { test, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { injectSession, cleanGroups } from "./helpers/auth"

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

test.describe("Pessimistic Reservation", () => {
  test.beforeEach(async () => {
    await cleanGroups()
  })

  test("adding a member creates a 'reserved' record in the database", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")
    await expect(page.getByText("Monte seu grupo")).toBeVisible({ timeout: 10000 })

    // Add Marina via search
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    // Verify in the database: Marina should have status 'reserved'
    const marinaId = (await supabase.from("profiles").select("id").eq("email", "marina.silva@al.unieduk.com.br").single()).data!.id
    const { data: member } = await supabase
      .from("group_members")
      .select("status")
      .eq("student_id", marinaId)
      .single()

    expect(member).not.toBeNull()
    expect(member!.status).toBe("reserved")
  })

  test("reserved student is filtered from search results", async ({ page }) => {
    // Pre-populate: Carlos already reserved Marina directly in DB
    const carlosId = (await supabase.from("profiles").select("id").eq("email", "carlos.souza@al.unieduk.com.br").single()).data!.id
    const marinaId = (await supabase.from("profiles").select("id").eq("email", "marina.silva@al.unieduk.com.br").single()).data!.id

    const { data: group } = await supabase
      .from("groups")
      .insert({ created_by: carlosId })
      .select("id")
      .single()

    await supabase.from("group_members").insert([
      { group_id: group!.id, student_id: carlosId, status: "confirmed" },
      { group_id: group!.id, student_id: marinaId, status: "reserved", reserved_at: new Date().toISOString() },
    ])

    // Login as aluno.teste — Marina should NOT appear
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")
    await expect(page.getByText("Monte seu grupo")).toBeVisible({ timeout: 10000 })

    await page.getByPlaceholder("Digite o nome do colega").fill("Marina Silva")
    await page.waitForTimeout(1000)
    await expect(page.getByRole("option", { name: /Marina Silva Costa/ })).not.toBeVisible()

    // But Mariana (different person) should appear
    await page.getByPlaceholder("Digite o nome do colega").fill("Mariana")
    await expect(page.getByRole("option", { name: /Mariana Oliveira Santos/ })).toBeVisible()
  })
})
