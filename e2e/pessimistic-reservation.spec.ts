import { test, expect } from "@playwright/test"
import {
  adminDb,
  getProfileId,
  loginAndGoToRegister,
  cleanGroupsFor,
} from "./helpers/auth"
import { TEST_EMAILS } from "./test-ids"

test.describe("Pessimistic Reservation", () => {
  test("adding a member creates a 'reserved' record in the database", async ({ page }) => {
    await cleanGroupsFor(TEST_EMAILS.aluno, TEST_EMAILS.marina)
    await loginAndGoToRegister(page, TEST_EMAILS.aluno)
    await expect(page.getByText("Monte seu grupo")).toBeVisible({ timeout: 10000 })

    // Add Marina via search
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    // Verify in the database: Marina should have status 'reserved'
    const marinaId = await getProfileId(TEST_EMAILS.marina)
    const { data: member } = await adminDb
      .from("group_members")
      .select("status")
      .eq("student_id", marinaId)
      .single()

    expect(member).not.toBeNull()
    expect(member!.status).toBe("reserved")
  })

  test("reserved student is filtered from search results", async ({ page }) => {
    // Pre-populate: Carlos already reserved Marina directly in DB
    await cleanGroupsFor(TEST_EMAILS.carlos)
    const carlosId = await getProfileId(TEST_EMAILS.carlos)
    const marinaId = await getProfileId(TEST_EMAILS.marina)
    await adminDb.from("group_members").delete().eq("student_id", marinaId)

    const { data: group } = await adminDb
      .from("groups")
      .insert({ created_by: carlosId })
      .select("id")
      .single()

    await adminDb.from("group_members").insert([
      { group_id: group!.id, student_id: carlosId, status: "confirmed" },
      { group_id: group!.id, student_id: marinaId, status: "reserved", reserved_at: new Date().toISOString() },
    ])

    // Login as joao.pedro — Marina should NOT appear
    await cleanGroupsFor(TEST_EMAILS.joao, TEST_EMAILS.mariana)
    await loginAndGoToRegister(page, TEST_EMAILS.joao)
    await expect(page.getByText("Monte seu grupo")).toBeVisible({ timeout: 10000 })

    await page.getByPlaceholder("Digite o nome do colega").fill("Marina Silva")
    await page.waitForTimeout(1000)
    await expect(page.getByRole("option", { name: /Marina Silva Costa/ })).not.toBeVisible()

    // But Mariana (different person) should appear
    await page.getByPlaceholder("Digite o nome do colega").fill("Mariana")
    await expect(page.getByRole("option", { name: /Mariana Oliveira Santos/ })).toBeVisible()
  })
})
