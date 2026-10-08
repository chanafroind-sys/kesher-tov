"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";
import type { HelperRelation } from "@/types/database";

export interface HelperCompanyLink {
  id: string;
  companyId: string;
  companyName: string;
  relation: HelperRelation;
  helpTypes: string[];
  isMuted: boolean;
}

const helperLinkItemSchema = z.object({
  companyId: z.string().uuid().or(z.string().min(1)),
  relation: z.enum(["current_employee", "past_employee", "close_connection"]),
  helpTypes: z.array(z.string()).default([]),
  isMuted: z.boolean().default(false),
});

const setHelperLinksSchema = z.object({
  links: z.array(helperLinkItemSchema),
  seeTasksFromAllCompanies: z.boolean().default(false),
});

/** Retrieve companies linked to current helper */
export async function getHelperLinks(): Promise<ActionResult<HelperCompanyLink[]>> {
  if (isMockMode()) {
    return {
      ok: true,
      data: [
        {
          id: "link-1",
          companyId: "comp-1",
          companyName: "מטריקס",
          relation: "current_employee",
          helpTypes: ["הגשת קו\"ח", "מידע על החברה", "הכנה לראיון"],
          isMuted: false,
        },
        {
          id: "link-2",
          companyId: "comp-3",
          companyName: "צ'ק פוינט",
          relation: "past_employee",
          helpTypes: ["הגשת קו\"ח"],
          isMuted: false,
        },
      ],
    };
  }
  return notImplementedError();
}

/** Save and update helper company links with relation and help capabilities */
export async function setHelperLinks(
  rawInput: z.infer<typeof setHelperLinksSchema>
): Promise<ActionResult<{ count: number }>> {
  const parse = setHelperLinksSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    return {
      ok: true,
      data: { count: parse.data.links.length },
    };
  }
  return notImplementedError();
}
