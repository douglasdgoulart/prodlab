import { test, expect } from "@playwright/test"
import {
  adminDb,
  getProfileId,
  injectSession,
  removeFromAllClasses,
} from "./helpers/auth"
import { TEST_EMAILS, CLASS_IDS } from "./test-ids"

test.describe("Waiting for Class", () => {
  test("student without class sees waiting page", async ({ page }) => {
    // Remove ana from all classes
    await removeFromAllClasses(TEST_EMAILS.ana)

    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await injectSession(page, TEST_EMAILS.ana)
    await page.goto("/dashboard")

    // Should redirect to /waiting
    await page.waitForURL("**/waiting", { timeout: 10000 })
    await expect(page.getByText("Quase lá!")).toBeVisible()
    await expect(
      page.getByText("Seu professor ainda não vinculou você a uma turma")
    ).toBeVisible()

    // Restore: add ana back to class
    const anaId = await getProfileId(TEST_EMAILS.ana)
    await adminDb.from("class_members").upsert(
      { class_id: CLASS_IDS.turmaNoturno, student_id: anaId },
      { onConflict: "class_id,student_id" }
    )
  })

  test("student with class but no group goes to /register", async ({ page }) => {
    // Ensure ana is in a class but has no group
    const anaId = await getProfileId(TEST_EMAILS.ana)
    await adminDb.from("group_members").delete().eq("student_id", anaId)
    await adminDb.from("groups").delete().eq("created_by", anaId)
    await adminDb.from("class_members").upsert(
      { class_id: CLASS_IDS.turmaNoturno, student_id: anaId },
      { onConflict: "class_id,student_id" }
    )

    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await injectSession(page, TEST_EMAILS.ana)
    await page.goto("/dashboard")

    // Should redirect to /register (has class, no group)
    await page.waitForURL("**/register", { timeout: 10000 })
    await expect(page.getByText("Monte seu grupo")).toBeVisible()
  })

  test("waiting page redirects to /register after class is assigned", async ({
    page,
  }) => {
    // Remove ana from classes
    await removeFromAllClasses(TEST_EMAILS.ana)

    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await injectSession(page, TEST_EMAILS.ana)
    await page.goto("/waiting")

    await expect(page.getByText("Quase lá!")).toBeVisible()

    // Simulate professor adding ana to a class (via admin)
    const anaId = await getProfileId(TEST_EMAILS.ana)
    await adminDb.from("class_members").insert({
      class_id: CLASS_IDS.turmaNoturno,
      student_id: anaId,
    })

    // Wait for polling to detect (30s interval, but we can wait)
    await page.waitForURL("**/register", { timeout: 40000 })
    await expect(page.getByText("Monte seu grupo")).toBeVisible()
  })

  test("student only sees classmates in search", async ({ page }) => {
    // Setup: put aluno.teste in turmaNoturno, marina in turmaMatutino
    const alunoId = await getProfileId(TEST_EMAILS.aluno)
    const marinaId = await getProfileId(TEST_EMAILS.marina)
    const marianaId = await getProfileId(TEST_EMAILS.mariana)

    // Clean groups
    await adminDb.from("group_members").delete().in("student_id", [alunoId, marinaId, marianaId])
    await adminDb.from("groups").delete().eq("created_by", alunoId)

    // Move Marina to turmaMatutino only
    await adminDb.from("class_members").delete().eq("student_id", marinaId)
    await adminDb.from("class_members").insert({
      class_id: CLASS_IDS.turmaMatutino,
      student_id: marinaId,
    })

    // Ensure Mariana is in turmaNoturno
    await adminDb.from("class_members").upsert(
      { class_id: CLASS_IDS.turmaNoturno, student_id: marianaId },
      { onConflict: "class_id,student_id" }
    )

    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await injectSession(page, TEST_EMAILS.aluno)
    await page.goto("/register")
    await expect(page.getByText("Monte seu grupo")).toBeVisible({ timeout: 10000 })

    // Search "Mari" — should find Mariana (same class) but NOT Marina (different class)
    await page.getByPlaceholder("Digite o nome do colega").fill("Mari")
    await page.waitForTimeout(1000)

    await expect(
      page.getByRole("option", { name: /Mariana Oliveira Santos/ })
    ).toBeVisible()
    await expect(
      page.getByRole("option", { name: /Marina Silva Costa/ })
    ).not.toBeVisible()

    // Restore Marina to turmaNoturno
    await adminDb.from("class_members").delete().eq("student_id", marinaId)
    await adminDb.from("class_members").insert({
      class_id: CLASS_IDS.turmaNoturno,
      student_id: marinaId,
    })
  })
})
