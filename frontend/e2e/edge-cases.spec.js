import { expect, test } from "@playwright/test";

test.describe("Edge cases & navigation", () => {
  test("home and menu render without errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /CafeProject'e hoş geldiniz/i })).toBeVisible();
    await page.goto("/menu");
    await expect(page.getByRole("heading", { name: "İmza menümüz" })).toBeVisible();
  });

  test("invalid user ID shows Turkish validation (after login)", async ({ page }) => {
    const u = `edge${Date.now()}`;
    await page.goto("/register");
    await page.getByLabel("Kullanıcı adı").fill(u);
    await page.getByLabel("Şifre", { exact: true }).fill("Test123!");
    await page.getByLabel("Ad", { exact: true }).fill("E");
    await page.getByLabel("Soyad", { exact: true }).fill("T");
    await page.getByLabel("E-posta").fill(`${u}@e2e.local`);
    await page.getByRole("button", { name: "Kayıt ol" }).click();
    await expect(page.locator("pre").filter({ hasText: "access_token" })).toBeVisible({ timeout: 20_000 });

    await page.goto("/users");
    await page.getByLabel("Kullanıcı ID ile getir").fill("abc");
    await page.getByRole("button", { name: "Getir" }).click();
    await expect(page.locator("pre.error")).toContainText("pozitif bir tam sayı", { timeout: 10_000 });
  });

  test("empty user ID does not call API (button disabled)", async ({ page }) => {
    await page.goto("/users");
    const getir = page.getByRole("button", { name: "Getir" });
    await expect(getir).toBeDisabled();
  });
});
