import { test, expect } from "@playwright/test";

test.describe("Smoke & Public Pages", () => {
  test("landing page renders in Hebrew with community values and login link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/קשר טוב/);
    await expect(page.locator("h1")).toContainText(/מישהי כבר עובדת שם/);
    await expect(page.locator("text=כניסה למערכת").first()).toBeVisible();
    await expect(page.locator("text=הצטרפות")).toBeVisible();
  });

  test("terms of service page loads cleanly", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText(/תנאי שימוש/);
    await expect(page.locator("text=אמנת הקהילה ותנאי השימוש")).toBeVisible();
  });

  test("privacy policy page loads cleanly", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(/מדיניות הפרטיות/);
  });
});
