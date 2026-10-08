import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface SampleEmailProps {
  helperName?: string;
  companyName?: string;
  jobTitle?: string;
  matchScore?: number;
  actionUrl?: string;
}

export function SampleEmail({
  helperName = "רבקה",
  companyName = "מטריקס",
  jobTitle = "מפתחת Full Stack",
  matchScore = 85,
  actionUrl = "https://kesher-tov.community/a/token-sample-12345",
}: SampleEmailProps) {
  return (
    <EmailLayout
      heading={`מישהי מחפשת עזרה ב${companyName}`}
      primaryAction={{
        label: "אני יכולה לעזור →",
        href: actionUrl,
      }}
      secondaryAction={{
        label: "לא מתאים לי הפעם",
        href: `${actionUrl}?dismiss=1`,
      }}
      footerNote="קיבלת מייל זה כי סימנת שאת עובדת או מכירה היטב את חברת מטריקס."
    >
      <Text style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: "600" }}>
        שלום {helperName},
      </Text>

      <Text style={{ margin: "0 0 14px 0" }}>
        חברת קהילה הגישה בקשת עזרה חדשה עבור משרת <strong>{jobTitle}</strong> ב<strong>{companyName}</strong>.
      </Text>

      <div
        style={{
          backgroundColor: "#f4f2ff",
          border: "1px solid #d8cfff",
          borderRadius: "12px",
          padding: "16px",
          margin: "20px 0",
        }}
      >
        <Text style={{ margin: "0 0 6px 0", fontWeight: "700", color: "#5a20d8" }}>
          התאמה מחושבת לדרישות המשרה: {matchScore}%
        </Text>
        <Text style={{ margin: 0, fontSize: "14px", color: "#514e66" }}>
          סוג העזרה המבוקש: הגשת קורות חיים מבפנים והמלצה אישית.
        </Text>
      </div>

      <Text style={{ margin: "0 0 14px 0" }}>
        בלחיצה על הכפתור תוכלי לקחת את המשימה. רק לאחר הלקיחה ייחשפו פרטי הנעזרת וקובץ קורות החיים שלה (עד 3 עוזרות למשימה).
      </Text>
    </EmailLayout>
  );
}

export default SampleEmail;
