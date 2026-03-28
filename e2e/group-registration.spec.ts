import { test, expect } from "@playwright/test"
import {
  loginAndGoToRegister,
  cleanGroupsFor,
  seedGroupAtStep2,
} from "./helpers/auth"
import { TEST_EMAILS, CLASS_IDS } from "./test-ids"

/**
 * Each test uses a DIFFERENT student to avoid cross-test contamination.
 * Tests that need step 2 pre-populate the DB state directly.
 *
 * Student assignments:
 *   - complete flow:          aluno.teste   + Marina
 *   - remove member:          joao          + Mariana
 *   - back button:            carlos        + Ana
 *   - redirect after complete: aluno.teste  (pre-populated complete group)
 *   - trend type hidden:      mariana       + Ana (pre-populated step 2)
 *   - 1 member only:          ana           (no partner)
 *   - max 3 members:          carlos        + Marina + João
 *   - no company name:        joao          + Marina (pre-populated step 2)
 *   - no product family:      marina        + Mariana (pre-populated step 2)
 *   - short company name:     ana           + Carlos (pre-populated step 2)
 *   - min 4 chars search:     mariana       (no partner needed)
 */

test.describe("Group Registration Wizard", () => {
  test("complete flow: search, add, fill details, finalize → dashboard", async ({
    page,
  }) => {
    await cleanGroupsFor(TEST_EMAILS.aluno)
    await loginAndGoToRegister(page, TEST_EMAILS.aluno)

    // --- Step 1 ---
    await expect(page.getByText("Monte seu grupo")).toBeVisible()
    await expect(page.getByText("Aluno Teste (você)")).toBeVisible()
    await expect(page.getByText("Membros do grupo (1/3)")).toBeVisible()

    const continueBtn = page.getByRole("button", { name: /continuar/i })
    await expect(continueBtn).toBeDisabled()

    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()

    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()
    await expect(continueBtn).toBeEnabled()
    await continueBtn.click()

    // --- Step 2 ---
    await expect(page.getByText("Detalhes do grupo")).toBeVisible()
    await expect(page.locator("[data-slot=chip-remove]")).toHaveCount(0)

    const finalizeBtn = page.getByRole("button", { name: /finalizar/i })
    await expect(finalizeBtn).toBeDisabled()

    await page.getByLabel("Nome da companhia").fill("TechNova Indústrias")
    await page.locator("[data-slot=select] button").click()
    await page.getByRole("option").first().click()

    await expect(finalizeBtn).toBeEnabled()
    await finalizeBtn.click()

    await page.waitForURL("**/dashboard", { timeout: 10000 })
    await expect(page.getByText("Bem-vindo ao ProdLab")).toBeVisible()
  })

  test("remove member before continuing", async ({ page }) => {
    await cleanGroupsFor(TEST_EMAILS.joao)
    await loginAndGoToRegister(page, TEST_EMAILS.joao)

    await expect(page.getByText("Monte seu grupo")).toBeVisible()

    await page.getByPlaceholder("Digite o nome do colega").fill("Mariana")
    await page.getByRole("option", { name: /Mariana Oliveira Santos/ }).click()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    const chip = page.locator("[data-slot=chip]", { hasText: "Mariana Oliveira Santos" })
    await chip.locator("[data-slot=chip-remove]").click()

    await expect(page.getByText("Membros do grupo (1/3)")).toBeVisible()
    await expect(page.getByRole("button", { name: /continuar/i })).toBeDisabled()
  })

  test("back button returns to step 1", async ({ page }) => {
    await cleanGroupsFor(TEST_EMAILS.carlos)
    await loginAndGoToRegister(page, TEST_EMAILS.carlos)

    await expect(page.getByText("Monte seu grupo")).toBeVisible()

    await page.getByPlaceholder("Digite o nome do colega").fill("Ana B")
    await page.getByRole("option", { name: /Ana Beatriz Ferreira/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()
    await page.getByRole("button", { name: /voltar/i }).click()
    await expect(page.getByText("Monte seu grupo")).toBeVisible()
  })

  test("completed group redirects directly to dashboard", async ({ page }) => {
    // Pre-populate a COMPLETE group in the DB via admin
    const { adminDb, getProfileId } = await import("./helpers/auth")
    await cleanGroupsFor(TEST_EMAILS.aluno)
    const ownerId = await getProfileId(TEST_EMAILS.aluno)
    const partnerId = await getProfileId(TEST_EMAILS.marina)

    await adminDb.from("group_members").delete().eq("student_id", partnerId)
    const { data: group } = await adminDb
      .from("groups")
      .insert({ created_by: ownerId, company_name: "TestCorp", status: "complete", class_id: CLASS_IDS.turmaNoturno })
      .select("id")
      .single()
    await adminDb.from("group_members").insert([
      { group_id: group!.id, student_id: ownerId, status: "confirmed" },
      { group_id: group!.id, student_id: partnerId, status: "confirmed" },
    ])

    await loginAndGoToRegister(page, TEST_EMAILS.aluno)

    // Should redirect to dashboard since group is complete
    await page.waitForURL("**/dashboard", { timeout: 10000 })
    await expect(page.getByText("Bem-vindo ao ProdLab")).toBeVisible()
  })

  test("product family dropdown shows only names (no trend type)", async ({
    page,
  }) => {
    // Pre-populate group at step 2
    await seedGroupAtStep2(TEST_EMAILS.mariana, TEST_EMAILS.ana, CLASS_IDS.turmaNoturno)
    await loginAndGoToRegister(page, TEST_EMAILS.mariana)

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()

    await page.locator("[data-slot=select] button").click()

    const options = page.getByRole("option")
    const count = await options.count()
    expect(count).toBeGreaterThanOrEqual(1)

    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent()
      expect(text).not.toMatch(
        /seasonal|growth|decline|stable|sazonal|crescimento/i
      )
    }
  })

  test("cannot continue with only 1 member (yourself)", async ({ page }) => {
    await cleanGroupsFor(TEST_EMAILS.ana)
    await loginAndGoToRegister(page, TEST_EMAILS.ana)

    await expect(page.getByText("Membros do grupo (1/3)")).toBeVisible()

    const continueBtn = page.getByRole("button", { name: /continuar/i })
    await expect(continueBtn).toBeDisabled()

    await continueBtn.click({ force: true })
    await expect(page.getByText("Monte seu grupo")).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
  })

  test("cannot add more than 2 colleagues (3 members total)", async ({
    page,
  }) => {
    await cleanGroupsFor(TEST_EMAILS.carlos, TEST_EMAILS.marina, TEST_EMAILS.joao)
    await loginAndGoToRegister(page, TEST_EMAILS.carlos)

    await expect(page.getByText("Monte seu grupo")).toBeVisible()

    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    await page.getByPlaceholder("Digite o nome do colega").fill("João")
    await page.getByRole("option", { name: /João Pedro Lima/ }).click()
    await expect(page.getByText("Membros do grupo (3/3)")).toBeVisible()

    await expect(page.getByPlaceholder("Digite o nome do colega")).toBeDisabled()
    await expect(page.getByRole("button", { name: /continuar/i })).toBeEnabled()
  })

  test("cannot finalize without company name", async ({ page }) => {
    await seedGroupAtStep2(TEST_EMAILS.joao, TEST_EMAILS.marina, CLASS_IDS.turmaNoturno)
    await loginAndGoToRegister(page, TEST_EMAILS.joao)

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()

    await page.locator("[data-slot=select] button").click()
    await page.getByRole("option").first().click()

    await expect(page.getByRole("button", { name: /finalizar/i })).toBeDisabled()
  })

  test("cannot finalize without product family", async ({ page }) => {
    await seedGroupAtStep2(TEST_EMAILS.marina, TEST_EMAILS.mariana, CLASS_IDS.turmaNoturno)
    await loginAndGoToRegister(page, TEST_EMAILS.marina)

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()

    await page.getByLabel("Nome da companhia").fill("TechNova")

    await expect(page.getByRole("button", { name: /finalizar/i })).toBeDisabled()
  })

  test("company name too short (< 3 chars) keeps finalize disabled", async ({
    page,
  }) => {
    await seedGroupAtStep2(TEST_EMAILS.ana, TEST_EMAILS.carlos, CLASS_IDS.turmaNoturno)
    await loginAndGoToRegister(page, TEST_EMAILS.ana)

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()

    await page.locator("[data-slot=select] button").click()
    await page.getByRole("option").first().click()

    await page.getByLabel("Nome da companhia").fill("AB")
    await expect(page.getByRole("button", { name: /finalizar/i })).toBeDisabled()

    await page.getByLabel("Nome da companhia").fill("ABC")
    await expect(page.getByRole("button", { name: /finalizar/i })).toBeEnabled()
  })

  test("search requires minimum 4 characters", async ({ page }) => {
    await cleanGroupsFor(TEST_EMAILS.mariana, TEST_EMAILS.marina)
    await loginAndGoToRegister(page, TEST_EMAILS.mariana)

    await expect(page.getByText("Monte seu grupo")).toBeVisible()

    const searchInput = page.getByPlaceholder("Digite o nome do colega")

    await searchInput.fill("Mar")
    await page.waitForTimeout(500)
    await expect(page.getByRole("listbox")).not.toBeVisible()

    await searchInput.fill("Mari")
    await expect(page.getByRole("listbox")).toBeVisible()
  })
})
