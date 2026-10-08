import { test, expect } from "@playwright/test";

test.describe("Hired, First Salary & Thanks Flow", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "kt_session",
        value: "mock-user-session",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("renders 3-step milestone tracker and gratitude cards", async ({ page }) => {
    await page.goto("/hired");

    // Header
    await expect(page.locator("h1")).toContainText(/התקבלתי לעבודה · הכרת הטוב/);

    // Milestones bar
    await expect(page.locator("text=התקבלתי לעבודה").first()).toBeVisible();
    await expect(page.locator("text=משכורת ראשונה")).toBeVisible();
    await expect(page.locator("text=סגירת מעגל התודה")).toBeVisible();

    // Thanks item details
    await expect(page.locator("text=העברה בנקאית").first()).toBeVisible();
  });
});
