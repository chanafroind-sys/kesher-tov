import { describe, it, expect } from "vitest";
import { searchCompanies, addCompany } from "@/lib/actions/companies";
import { createTask } from "@/lib/actions/tasks";
import { getHelperLinks, setHelperLinks } from "@/lib/actions/helperLinks";
import { listThanks, markHired, markFirstSalary, markPaid } from "@/lib/actions/thanks";
import { getNotificationPrefs, setNotificationPrefs, listInAppNotifications } from "@/lib/actions/notifications";

describe("Server Actions in Mock/Dev mode", () => {
  it("searches and filters companies", async () => {
    const res = await searchCompanies({ query: "מטריקס" });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].nameHe).toContain("מטריקס");
    }
  });

  it("adds a new company manually", async () => {
    const res = await addCompany({
      nameHe: "סטארטאפ בדיקה",
      nameEn: "TestStartup",
      category: "hitech",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.nameHe).toBe("סטארטאפ בדיקה");
    }
  });

  it("creates a new help task with requirements", async () => {
    const res = await createTask({
      companyId: "comp-1",
      helpTypes: ["הגשת קו\"ח"],
      thanksAmount: 100,
      requirements: [
        { text: "ניסיון ב-React", required: true, match: "full" },
        { text: "ידע ב-Node", required: false, match: "partial" },
      ],
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.taskId).toBeDefined();
    }
  });

  it("reads and updates helper company links", async () => {
    const getRes = await getHelperLinks();
    expect(getRes.ok).toBe(true);

    const setRes = await setHelperLinks({
      links: [
        {
          companyId: "comp-1",
          relation: "current_employee",
          helpTypes: ["הגשת קו\"ח"],
          isMuted: false,
        },
      ],
      seeTasksFromAllCompanies: true,
    });
    expect(setRes.ok).toBe(true);
  });

  it("handles thanks workflow: list, markHired, markFirstSalary, markPaid", async () => {
    const listRes = await listThanks();
    expect(listRes.ok).toBe(true);

    const hiredRes = await markHired("מטריקס");
    expect(hiredRes.ok).toBe(true);

    const salaryRes = await markFirstSalary();
    expect(salaryRes.ok).toBe(true);

    const paidRes = await markPaid({ thanksId: "th-1", note: "תודה רבה!" });
    expect(paidRes.ok).toBe(true);
  });

  it("handles notification preferences and in-app notifications", async () => {
    const prefsRes = await getNotificationPrefs();
    expect(prefsRes.ok).toBe(true);

    const setPrefsRes = await setNotificationPrefs({
      frequency: "daily_digest",
      digestHour: 19,
      mutedCompanyIds: [],
    });
    expect(setPrefsRes.ok).toBe(true);

    const notifsRes = await listInAppNotifications();
    expect(notifsRes.ok).toBe(true);
  });
});
