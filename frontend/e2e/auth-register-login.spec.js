import { expect, test } from "@playwright/test";

test.describe("Auth via gateway (Vite proxy)", () => {
  test("register then login returns tokens in UI", async ({ page }) => {
    const u = `pw${Date.now()}`;
    const email = `${u}@e2e.local`;

    await page.goto("/register");
    await page.getByLabel("Kullanıcı adı").fill(u);
    await page.getByLabel("Şifre", { exact: true }).fill("Test123!");
    await page.getByLabel("Ad", { exact: true }).fill("Play");
    await page.getByLabel("Soyad", { exact: true }).fill("Wright");
    await page.getByLabel("E-posta").fill(email);
    await page.getByRole("button", { name: "Kayıt ol" }).click();

    await expect(page.locator("pre").filter({ hasText: "access_token" })).toBeVisible({
      timeout: 15_000
    });

    await page.goto("/login");
    await page.getByLabel("Kullanıcı adı").fill(u);
    await page.getByLabel("Şifre", { exact: true }).fill("Test123!");
    await page.getByRole("button", { name: "Giriş yap" }).click();

    await expect(page.locator("pre").filter({ hasText: "access_token" })).toBeVisible({
      timeout: 15_000
    });
  });
});
