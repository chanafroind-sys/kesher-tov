import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface NewTaskEmailProps {
  helperName: string;
  companyName: string;
  jobTitle?: string;
  helpTypes: string[];
  matchScore: number;
  claimUrl: string;
  passUrl?: string;
  muteCompanyUrl?: string;
}

export function NewTaskEmail({
  helperName = "שרה",
  companyName = "מטריקס",
  jobTitle = "מפתחת Full Stack",
  helpTypes = ["הגשת קו\"ח מבפנים", "מידע פנימי"],
  matchScore = 90,
  claimUrl = "https://kesher-tov.community/a/claim-token-123",
  passUrl = "https://kesher-tov.community/a/pass-token-123",
  muteCompanyUrl = "https://kesher-tov.community/a/mute-token-123",
}: NewTaskEmailProps) {
  return (
    <EmailLayout
      previewText={`מישהי מחפשת עזרה ב${companyName} (${matchScore}% התאמה)`}
      heading={`שלום ${helperName}, מישהי צריכה אותך ב${companyName}!`}
      primaryAction={{
        label: "אני יכולה לעזור ←",
        href: claimUrl,
      }}
      secondaryAction={
        passUrl
          ? {
              label: "לא הפעם",
              href: passUrl,
            }
          : undefined
      }
      footerNote={
        muteCompanyUrl
          ? `לא עובדת יותר ב${companyName}? אפשר להשתיק התראות עבור חברה זו`
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        חברת קהילה הגישה בקשת סיוע עבור משרה ב<strong>{companyName}</strong>
        {jobTitle ? ` (${jobTitle})` : ""}.
      </Text>

      <Section
        style={{
          backgroundColor: "#fbf8f3",
          borderRadius: "16px",
          border: "1px solid #ede9e1",
          padding: "16px 20px",
          margin: "18px 0",
        }}
      >
        <Text style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1b1830", fontWeight: "bold" }}>
          🎯 התאמה למשרה: <span style={{ color: "#5a20d8" }}>{matchScore}%</span>
        </Text>
        <Text style={{ margin: "0", fontSize: "14px", color: "#6b6880" }}>
          עזרה מבוקשת: <strong>{helpTypes.join(", ")}</strong>
        </Text>
      </Section>

      <Text style={{ fontSize: "14px", color: "#6b6880", lineHeight: "1.5" }}>
        עד 3 עוזרות יכולות לקחת כל משימה. בלחיצה על הכפתור תקבלי את פרטי הנעזרת ואת קורות החיים שלה לצפייה ישירה.
      </Text>
    </EmailLayout>
  );
}

export default NewTaskEmail;
