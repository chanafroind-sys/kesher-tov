import { test, expect } from "@playwright/test";

test.describe("Companies & Helper Links Flow", () => {
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

  test("renders companies management screen with helper links", async ({ page }) => {
    await page.goto("/companies");

    // Header
    await expect(page.locator("h1")).toContainText(/החברות שלי/);
    await expect(page.locator("text=הגדירי באילו חברות את עובדת או מכירה")).toBeVisible();

    // Company picker for adding new companies
    await expect(page.locator("text=הוספת חברה חדשה")).toBeVisible();

    // Existing mock helper links
    await expect(page.locator("text=עובדת נוכחית בחברה").first()).toBeVisible();
  });
});
