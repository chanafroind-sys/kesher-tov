import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("allows user to enter email, receive mock OTP and sign in", async ({ page }) => {
    await page.goto("/login");

    // Check login form is present
    await expect(page.locator("h1")).toContainText(/כניסה והרשמה/);

    // Enter email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("chana@example.com");

    // Click submit
    await page.locator('button[type="submit"]:has-text("שליחת קוד אימות למייל")').click();

    // Verify transition to OTP screen
    await expect(page.locator("text=קוד אימות בן 6 ספרות").first()).toBeVisible();

    // Type 6 digit OTP (e.g. 123456)
    const digitInputs = page.locator('input[type="text"][inputmode="numeric"]');
    await expect(digitInputs).toHaveCount(6);

    for (let i = 0; i < 6; i++) {
      await digitInputs.nth(i).fill(String(i + 1));
    }

    // Auto verification redirects to dashboard
    await page.waitForURL("/", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/שלום, שרה כהן!/);
  });
});
