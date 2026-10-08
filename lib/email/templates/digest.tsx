import * as React from "react";
import { Text, Section, Button } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface DigestTaskItem {
  id: string;
  companyName: string;
  jobTitle?: string;
  matchScore: number;
  helpTypes: string[];
  claimUrl: string;
}

export interface DigestEmailProps {
  helperName: string;
  tasks: DigestTaskItem[];
  settingsUrl?: string;
}

export function DigestEmail({
  helperName = "מרים",
  tasks = [
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
  settingsUrl = "https://kesher-tov.community/settings/notifications",
}: DigestEmailProps) {
  return (
    <EmailLayout
      previewText={`סיכום משימות: ${tasks.length} בקשות עזרה חדשות בחברות שלך`}
      heading={`שלום ${helperName}, הנה סיכום המשימות היומי`}
      secondaryAction={
        settingsUrl
          ? {
              label: "לשינוי שעת הסיכום או תדירות ההודעות",
              href: settingsUrl,
            }
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        נשים מהקהילה פתחו בקשות סיוע בחברות שסימנת:
      </Text>

      {tasks.map((t) => (
        <Section
          key={t.id}
          style={{
            backgroundColor: "#fbf8f3",
            borderRadius: "16px",
            border: "1px solid #ede9e1",
            padding: "18px 20px",
            margin: "14px 0",
            textAlign: "right",
          }}
        >
          <Text style={{ margin: "0 0 6px 0", fontSize: "17px", fontWeight: "bold", color: "#1b1830" }}>
            {t.companyName} {t.jobTitle ? `· ${t.jobTitle}` : ""}
          </Text>
          <Text style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#6b6880" }}>
            🎯 התאמה: <strong style={{ color: "#5a20d8" }}>{t.matchScore}%</strong> · סיוע: {t.helpTypes.join(", ")}
          </Text>

          <Button
            href={t.claimUrl}
            style={{
              backgroundColor: "#5a20d8",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold",
              borderRadius: "10px",
              padding: "10px 22px",
              textDecoration: "none",
            }}
          >
            אני יכולה לעזור ←
          </Button>
        </Section>
      ))}
    </EmailLayout>
  );
}

export default DigestEmail;
