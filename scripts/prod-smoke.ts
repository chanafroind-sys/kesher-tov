/**
 * Production Readiness & Smoke Test CLI (O14 / #30)
 * Run with: npx tsx scripts/prod-smoke.ts
 */

import * as React from "react";
import { render } from "@react-email/components";
import { calculateMatchScore, getSeekerLimits } from "../lib/reliability";
import { createActionToken, verifyActionToken } from "../lib/tokens";
import { isQuietWindow } from "../lib/notifications/shabbat";
import { NewTaskEmail } from "../lib/email/templates";
import { planHelperWaves } from "../lib/notifications/waves";

async function runProdSmokeCheck() {
  console.log("==================================================");
  console.log("   קשר טוב — Production Verification & Smoke Check");
  console.log("==================================================\n");

  let allPassed = true;

  // 1. Check Action Token generation & single-use verification
  try {
    process.stdout.write("1. בדיקת חתימה ואימות של טוקן פעולה במייל... ");
    const tokenResult = await createActionToken({
      action: "claim_task",
      userId: "prod-verify-user",
      payload: { taskId: "prod-verify-task" },
    });
    const verified = await verifyActionToken(tokenResult.token);
    if (verified.ok && verified.data.action === "claim_task") {
      console.log("✓ תקין");
    } else {
      throw new Error("Token verification failed");
    }
  } catch (err) {
    allPassed = false;
    console.log("✕ שגיאה:", err);
  }

  // 2. Check Shabbat & Holiday Quiet Window Calculator
  try {
    process.stdout.write("2. בדיקת מנגנון השהיית התראות בשבתות וחגים... ");
    // Normal Tuesday afternoon (not quiet)
    const tuesday = new Date("2026-10-13T12:00:00Z");
    const isTuesdayQuiet = isQuietWindow(tuesday);

    // Friday evening (quiet window)
    const fridayEvening = new Date("2026-10-16T17:00:00Z");
    const isFridayQuiet = isQuietWindow(fridayEvening);

    if (!isTuesdayQuiet && isFridayQuiet) {
      console.log("✓ תקין");
    } else {
      throw new Error("Shabbat window calculation mismatch");
    }
  } catch (err) {
    allPassed = false;
    console.log("✕ שגיאה:", err);
  }

  // 3. Check Reliability Scoring & Fairness Engine
  try {
    process.stdout.write("3. בדיקת נוסחאות אמינות ומגבלות משימות... ");
    const match = calculateMatchScore([
      { text: "React", required: true, match: "full" },
      { text: "Next.js", required: false, match: "partial" },
    ]);
    const limits = getSeekerLimits("user-1", []);
    if (match === 83 && limits.maxOpenTasks === 5) {
      console.log("✓ תקין");
    } else {
      throw new Error(`Scoring calculation mismatch: score=${match}`);
    }
  } catch (err) {
    allPassed = false;
    console.log("✕ שגיאה:", err);
  }

  // 4. Check Wave Dispatch Planner
  try {
    process.stdout.write("4. בדיקת מנגנון שליחה בגלים (Wave Dispatch)... ");
    const plan = planHelperWaves({
      taskId: "task-1",
      helpers: [
        { id: "1", name: "A", email: "a@b.com", relation: "current_employee", replyRate: 100, isDeprioritized: false },
        { id: "2", name: "B", email: "b@b.com", relation: "past_employee", replyRate: 80, isDeprioritized: false },
        { id: "3", name: "C", email: "c@b.com", relation: "close_connection", replyRate: 70, isDeprioritized: false },
        { id: "4", name: "D", email: "d@b.com", relation: "current_employee", replyRate: 90, isDeprioritized: false },
      ],
      seekerIsRestricted: false,
    });
    if (plan.waves.length === 2 && plan.waves[0].helpers.length === 3) {
      console.log("✓ תקין");
    } else {
      throw new Error("Wave dispatch plan calculation mismatch");
    }
  } catch (err) {
    allPassed = false;
    console.log("✕ שגיאה:", err);
  }

  // 5. Check React Email Template Compilation
  try {
    process.stdout.write("5. בדיקת תקינות עיבוד תבניות מייל... ");
    const html = await render(
      React.createElement(NewTaskEmail, {
        helperName: "שרה",
        companyName: "מטריקס",
        helpTypes: ["הגשת קו\"ח"],
        matchScore: 92,
        claimUrl: "https://kesher-tov.co.il/a/token123",
      })
    );
    if (html.includes("מטריקס") && html.includes("92%")) {
      console.log("✓ תקין");
    } else {
      throw new Error("Email template rendering failed");
    }
  } catch (err) {
    allPassed = false;
    console.log("✕ שגיאה:", err);
  }

  console.log("\n--------------------------------------------------");
  if (allPassed) {
    console.log("🎉 כל בדיקות העשן עברו בהצלחה 100%! המערכת מוכנה לייצור.");
  } else {
    console.log("⚠️ נמצאו תקלות באחת או יותר מבדיקות המערכת.");
    process.exit(1);
  }
}

runProdSmokeCheck().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
