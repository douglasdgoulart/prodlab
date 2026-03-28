import { test, expect } from "@playwright/test"
import { injectSession, cleanGroups } from "./helpers/auth"

test.describe("Group Registration Wizard", () => {
  test.beforeEach(async () => {
    await cleanGroups()
  })

  test("complete flow: search member, add, fill details, finalize → dashboard", async ({
    page,
  }) => {
    // Navigate to app and inject authenticated session
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    // --- Step 1: Monte seu grupo ---

    await expect(page.getByText("Monte seu grupo")).toBeVisible()
    await expect(page.getByText("Aluno Teste (você)")).toBeVisible()
    await expect(page.getByText("Membros do grupo (1/3)")).toBeVisible()

    // Continuar should be disabled (only 1 member)
    const continueBtn = page.getByRole("button", { name: /continuar/i })
    await expect(continueBtn).toBeDisabled()

    // Search for a colleague (min 4 chars)
    const searchInput = page.getByPlaceholder("Digite o nome do colega")
    await searchInput.fill("Mari")

    // Wait for dropdown results
    const dropdown = page.getByRole("listbox")
    await expect(dropdown).toBeVisible()
    await expect(page.getByRole("option")).toHaveCount(2) // Marina + Mariana

    // Select Marina Silva Costa
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()

    // Verify member was added
    await expect(page.getByText("Marina Silva Costa")).toBeVisible()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    // Verify remove button exists on added member (not on "você")
    const marinaChip = page.locator("[data-slot=chip]", {
      hasText: "Marina Silva Costa",
    })
    await expect(
      marinaChip.locator("[data-slot=chip-remove]")
    ).toBeVisible()

    // Continuar should now be enabled
    await expect(continueBtn).toBeEnabled()
    await continueBtn.click()

    // --- Step 2: Detalhes do grupo ---

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()
    await expect(
      page.getByText("Defina a identidade da sua companhia")
    ).toBeVisible()

    // Members shown as read-only (no remove buttons)
    await expect(page.getByText("Aluno Teste (você)")).toBeVisible()
    await expect(page.getByText("Marina Silva Costa")).toBeVisible()
    await expect(page.locator("[data-slot=chip-remove]")).toHaveCount(0)

    // Finalizar should be disabled (empty form)
    const finalizeBtn = page.getByRole("button", { name: /finalizar/i })
    await expect(finalizeBtn).toBeDisabled()

    // Fill company name
    await page.getByLabel("Nome da companhia").fill("TechNova Indústrias")

    // Still disabled (no product family selected)
    await expect(finalizeBtn).toBeDisabled()

    // Open product family dropdown and select
    await page
      .locator("[data-slot=select] button")
      .click()
    await page
      .getByRole("option", { name: "Cerveja Artesanal" })
      .click()

    // Verify selection
    await expect(
      page.locator("[data-slot=select]")
    ).toContainText("Cerveja Artesanal")

    // Finalizar should now be enabled
    await expect(finalizeBtn).toBeEnabled()
    await finalizeBtn.click()

    // --- Should redirect to dashboard ---

    await page.waitForURL("**/dashboard", { timeout: 10000 })
    await expect(page.getByText("Bem-vindo ao ProdLab")).toBeVisible()
  })

  test("remove member before continuing", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    await expect(page.getByText("Monte seu grupo")).toBeVisible()

    // Add Marina
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    // Remove Marina
    const marinaChip = page.locator("[data-slot=chip]", {
      hasText: "Marina Silva Costa",
    })
    await marinaChip.locator("[data-slot=chip-remove]").click()

    // Should be back to 1 member, Continuar disabled
    await expect(page.getByText("Membros do grupo (1/3)")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /continuar/i })
    ).toBeDisabled()
  })

  test("back button returns to step 1", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    // Add member and advance
    await page.getByPlaceholder("Digite o nome do colega").fill("João")
    await page.getByRole("option", { name: /João Pedro Lima/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    await expect(page.getByText("Detalhes do grupo")).toBeVisible()

    // Click Voltar
    await page.getByRole("button", { name: /voltar/i }).click()

    await expect(page.getByText("Monte seu grupo")).toBeVisible()
  })

  test("completed group redirects directly to dashboard", async ({ page }) => {
    // First, complete the registration
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    await page.getByLabel("Nome da companhia").fill("TestCorp")
    await page.locator("[data-slot=select] button").click()
    await page.getByRole("option", { name: "Cerveja Artesanal" }).click()
    await page.getByRole("button", { name: /finalizar/i }).click()
    await page.waitForURL("**/dashboard", { timeout: 10000 })

    // Now visit /register again — should redirect to dashboard
    await page.goto("/register")
    await page.waitForURL("**/dashboard", { timeout: 10000 })
    await expect(page.getByText("Bem-vindo ao ProdLab")).toBeVisible()
  })

  test("product family dropdown shows only names (no trend type)", async ({
    page,
  }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    // Add member and advance to step 2
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    // Open dropdown
    await page.locator("[data-slot=select] button").click()

    // Should show names only
    const options = page.getByRole("option")
    const count = await options.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // None should contain trend type keywords
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent()
      expect(text).not.toMatch(
        /seasonal|growth|decline|stable|sazonal|crescimento/i
      )
    }
  })

  test("cannot continue with only 1 member (yourself)", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    await expect(page.getByText("Membros do grupo (1/3)")).toBeVisible()

    // Continuar must stay disabled with just the creator
    const continueBtn = page.getByRole("button", { name: /continuar/i })
    await expect(continueBtn).toBeDisabled()

    // Clicking should have no effect (button is disabled, but verify no navigation)
    await continueBtn.click({ force: true })
    await expect(page.getByText("Monte seu grupo")).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
  })

  test("cannot add more than 2 colleagues (3 members total)", async ({
    page,
  }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    // Add first colleague
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await expect(page.getByText("Membros do grupo (2/3)")).toBeVisible()

    // Add second colleague
    await page.getByPlaceholder("Digite o nome do colega").fill("João")
    await page.getByRole("option", { name: /João Pedro Lima/ }).click()
    await expect(page.getByText("Membros do grupo (3/3)")).toBeVisible()

    // Search input should be disabled now (max reached)
    await expect(
      page.getByPlaceholder("Digite o nome do colega")
    ).toBeDisabled()

    // Continuar should be enabled (3 is valid)
    await expect(
      page.getByRole("button", { name: /continuar/i })
    ).toBeEnabled()
  })

  test("cannot finalize without company name", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    // Add member and advance
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    // Select product family but leave company name empty
    await page.locator("[data-slot=select] button").click()
    await page.getByRole("option", { name: "Cerveja Artesanal" }).click()

    // Finalizar should be disabled (no company name)
    await expect(
      page.getByRole("button", { name: /finalizar/i })
    ).toBeDisabled()
  })

  test("cannot finalize without product family", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    // Add member and advance
    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    // Fill company name but skip product family
    await page.getByLabel("Nome da companhia").fill("TechNova")

    // Finalizar should be disabled (no product family)
    await expect(
      page.getByRole("button", { name: /finalizar/i })
    ).toBeDisabled()
  })

  test("company name too short (< 3 chars) keeps finalize disabled", async ({
    page,
  }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    await page.getByPlaceholder("Digite o nome do colega").fill("Marina")
    await page.getByRole("option", { name: /Marina Silva Costa/ }).click()
    await page.getByRole("button", { name: /continuar/i }).click()

    // Select product family
    await page.locator("[data-slot=select] button").click()
    await page.getByRole("option", { name: "Cerveja Artesanal" }).click()

    // Type only 2 chars
    await page.getByLabel("Nome da companhia").fill("AB")
    await expect(
      page.getByRole("button", { name: /finalizar/i })
    ).toBeDisabled()

    // Type 3 chars — should enable
    await page.getByLabel("Nome da companhia").fill("ABC")
    await expect(
      page.getByRole("button", { name: /finalizar/i })
    ).toBeEnabled()
  })

  test("search requires minimum 4 characters", async ({ page }) => {
    await page.goto("/")
    await injectSession(page, "aluno.teste@al.unieduk.com.br")
    await page.goto("/register")

    const searchInput = page.getByPlaceholder("Digite o nome do colega")

    // Type 3 chars — no dropdown
    await searchInput.fill("Mar")
    await page.waitForTimeout(500)
    await expect(page.getByRole("listbox")).not.toBeVisible()

    // Type 4th char — dropdown appears
    await searchInput.fill("Mari")
    await expect(page.getByRole("listbox")).toBeVisible()
  })
})
