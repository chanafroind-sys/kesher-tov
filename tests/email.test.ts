import { describe, it, expect } from "vitest";
import * as React from "react";
import { render } from "@react-email/components";
import {
  NewTaskEmail,
  ClaimDetailsEmail,
  ClaimedYourTaskEmail,
  HelperMarkedDoneEmail,
  YouWereChosenEmail,
  TaskClosedOtherEmail,
  HiredEmail,
  FirstSalaryQuestionEmail,
  ThanksListEmail,
  ThanksReceivedEmail,
  DigestEmail,
} from "@/lib/email/templates";

describe("Email Templates Rendering", () => {
  it("renders newTask email template", async () => {
    const html = await render(
      React.createElement(NewTaskEmail, {
        helperName: "שרה",
        companyName: "מטריקס",
        helpTypes: ["הגשת קו\"ח"],
        matchScore: 90,
        claimUrl: "https://example.com/claim",
      })
    );
    expect(html).toContain("מטריקס");
    expect(html).toContain("90%");
    expect(html).toContain("אני יכולה לעזור");
  });

  it("renders claimDetails email with seeker info", async () => {
    const html = await render(
      React.createElement(ClaimDetailsEmail, {
        helperName: "מרים",
        seekerName: "שרה כהן",
        companyName: "מטריקס",
        cvDownloadUrl: "https://example.com/cv.pdf",
        markDoneUrl: "https://example.com/done",
      })
    );
    expect(html).toContain("שרה כהן");
    expect(html).toContain("עשיתי את שלי");
  });

  it("renders digest email with multiple tasks", async () => {
    const html = await render(
      React.createElement(DigestEmail, {
        helperName: "מרים",
        tasks: [
          {
            id: "1",
            companyName: "צ'ק פוינט",
            matchScore: 95,
            helpTypes: ["הגשת קו\"ח"],
            claimUrl: "https://example.com/claim",
          },
        ],
      })
    );
    expect(html).toContain("צ&#x27;ק פוינט");
    expect(html).toContain("95");
  });

  it("renders all remaining email templates without crashing", async () => {
    const templates = [
      React.createElement(ClaimedYourTaskEmail, {
        seekerName: "שרה",
        companyName: "מטריקס",
        taskUrl: "https://example.com",
      }),
      React.createElement(HelperMarkedDoneEmail, {
        seekerName: "שרה",
        helperName: "מרים",
        companyName: "מטריקס",
        closeTaskUrl: "https://example.com",
      }),
      React.createElement(YouWereChosenEmail, {
        helperName: "מרים",
        seekerName: "שרה",
        companyName: "מטריקס",
        thanksAmount: 100,
      }),
      React.createElement(TaskClosedOtherEmail, {
        helperName: "רחל",
        companyName: "מטריקס",
      }),
      React.createElement(HiredEmail, {
        seekerName: "שרה",
        companyName: "מטריקס",
        hiredUrl: "https://example.com",
      }),
      React.createElement(FirstSalaryQuestionEmail, {
        seekerName: "שרה",
        companyName: "מטריקס",
        yesSalaryUrl: "https://example.com",
      }),
      React.createElement(ThanksListEmail, {
        seekerName: "שרה",
        helpers: [],
      }),
      React.createElement(ThanksReceivedEmail, {
        helperName: "מרים",
        seekerName: "שרה",
        amount: 100,
      }),
    ];

    for (const el of templates) {
      const html = await render(el);
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(100);
    }
  });
});
