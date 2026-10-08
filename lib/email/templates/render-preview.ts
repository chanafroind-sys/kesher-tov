import fs from "fs";
import path from "path";
import * as React from "react";
import { render } from "@react-email/components";

import { NewTaskEmail } from "./newTask";
import { ClaimDetailsEmail } from "./claimDetails";
import { ClaimedYourTaskEmail } from "./claimedYourTask";
import { HelperMarkedDoneEmail } from "./helperMarkedDone";
import { YouWereChosenEmail } from "./youWereChosen";
import { TaskClosedOtherEmail } from "./taskClosedOther";
import { HiredEmail } from "./hired";
import { FirstSalaryQuestionEmail } from "./firstSalaryQuestion";
import { ThanksListEmail } from "./thanksList";
import { ThanksReceivedEmail } from "./thanksReceived";
import { DigestEmail } from "./digest";

export async function renderAllEmailPreviews() {
  const outputDir = path.resolve(process.cwd(), "docs/email-preview");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const templates: Record<string, React.ReactElement> = {
    newTask: React.createElement(NewTaskEmail, {
      helperName: "שרה",
      companyName: "מטריקס",
      jobTitle: "מפתחת Full Stack",
      helpTypes: ["הגשת קו\"ח מבפנים", "מידע פנימי"],
      matchScore: 90,
      claimUrl: "https://kesher-tov.community/a/claim-token",
      passUrl: "https://kesher-tov.community/a/pass-token",
      muteCompanyUrl: "https://kesher-tov.community/a/mute-token",
    }),
    claimDetails: React.createElement(ClaimDetailsEmail, {
      helperName: "מרים",
      seekerName: "שרה כהן",
      seekerPhone: "050-1234567",
      companyName: "מטריקס",
      cvDownloadUrl: "https://kesher-tov.community/cv/sample.pdf",
      markDoneUrl: "https://kesher-tov.community/a/done-token",
    }),
    claimedYourTask: React.createElement(ClaimedYourTaskEmail, {
      seekerName: "שרה",
      companyName: "מטריקס",
      taskUrl: "https://kesher-tov.community/tasks/123",
    }),
    helperMarkedDone: React.createElement(HelperMarkedDoneEmail, {
      seekerName: "שרה",
      helperName: "מרים",
      companyName: "מטריקס",
      closeTaskUrl: "https://kesher-tov.community/tasks/123",
      notYetUrl: "https://kesher-tov.community/a/notyet-token",
    }),
    youWereChosen: React.createElement(YouWereChosenEmail, {
      helperName: "מרים",
      seekerName: "שרה כהן",
      companyName: "מטריקס",
      thanksAmount: 100,
    }),
    taskClosedOther: React.createElement(TaskClosedOtherEmail, {
      helperName: "רחל",
      companyName: "מטריקס",
    }),
    hired: React.createElement(HiredEmail, {
      seekerName: "שרה",
      companyName: "מטריקס",
      hiredUrl: "https://kesher-tov.community/hired",
    }),
    firstSalaryQuestion: React.createElement(FirstSalaryQuestionEmail, {
      seekerName: "שרה",
      companyName: "מטריקס",
      yesSalaryUrl: "https://kesher-tov.community/a/salary-yes",
      notYetUrl: "https://kesher-tov.community/a/salary-notyet",
    }),
    thanksList: React.createElement(ThanksListEmail, {
      seekerName: "שרה",
      helpers: [
        {
          name: "מרים לוי",
          companyName: "מטריקס",
          amount: 100,
          paymentType: "העברה בנקאית",
          paymentDetails: "בנק לאומי (10), סניף 800, חשבון 456789",
          markPaidUrl: "https://kesher-tov.community/a/paid-1",
        },
      ],
      hiredDashboardUrl: "https://kesher-tov.community/hired",
    }),
    thanksReceived: React.createElement(ThanksReceivedEmail, {
      helperName: "מרים",
      seekerName: "שרה כהן",
      amount: 100,
      note: "מרים היקרה, תודה ענקית על הכל! בזכותך התקבלתי ואני מודה לך מכל הלב.",
    }),
    digest: React.createElement(DigestEmail, {
      helperName: "מרים",
      tasks: [
        {
          id: "task-1",
          companyName: "מטריקס",
          jobTitle: "מפתחת Full Stack",
          matchScore: 92,
          helpTypes: ["הגשת קו\"ח"],
          claimUrl: "https://kesher-tov.community/a/claim-1",
        },
        {
          id: "task-2",
          companyName: "צ'ק פוינט",
          jobTitle: "בודקת תוכנה QA",
          matchScore: 85,
          helpTypes: ["מידע פנימי", "הכנה לראיון"],
          claimUrl: "https://kesher-tov.community/a/claim-2",
        },
      ],
      settingsUrl: "https://kesher-tov.community/settings/notifications",
    }),
  };

  for (const [name, element] of Object.entries(templates)) {
    const html = await render(element);
    const filePath = path.join(outputDir, `${name}.html`);
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`Rendered preview for ${name} -> ${filePath}`);
  }

  // Also write index / sample
  const samplePath = path.resolve(process.cwd(), "docs/email-preview.html");
  const firstHtml = await render(templates.newTask);
  fs.writeFileSync(samplePath, firstHtml, "utf8");

  console.log(`Successfully generated all ${Object.keys(templates).length} email previews!`);
}

renderAllEmailPreviews().catch((err) => {
  console.error("Failed to render email previews:", err);
  process.exit(1);
});
