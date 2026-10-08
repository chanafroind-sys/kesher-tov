import { test, expect } from "@playwright/test";

test.describe("Tasks Lifecycle Flow", () => {
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

  test("loads task creation wizard with requirements and match gauge", async ({ page }) => {
    await page.goto("/tasks/new");

    // Wizard header
    await expect(page.locator("h1")).toContainText(/פתיחת משימה חדשה/);

    // Company picker exists
    await expect(page.locator("text=החברה והמשרה המבוקשת")).toBeVisible();
    await expect(page.locator('input[placeholder*="חפשי חברה"]')).toBeVisible();

    // Help types selectable
    await expect(page.locator("text=הגשת קו\"ח מבפנים")).toBeVisible();

    // Match gauge card is visible
    await expect(page.locator("text=ציון התאמה")).toBeVisible();

    // Thanks presets visible
    await expect(page.locator("text=₪100")).toBeVisible();
    await expect(page.locator("text=חסד")).toBeVisible();
  });

  test("views task details page with claim and close actions", async ({ page }) => {
    await page.goto("/tasks/task-s-1");

    // Task details loaded
    await expect(page.locator("text=מטריקס").first()).toBeVisible();
    await expect(page.locator("text=התאמה מחושבת")).toBeVisible();
    await expect(page.locator("text=תודה לאחר משכורת")).toBeVisible();
  });
});
