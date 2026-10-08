import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface TaskClosedOtherEmailProps {
  helperName: string;
  companyName: string;
  dashboardUrl?: string;
}

export function TaskClosedOtherEmail({
  helperName = "רחל",
  companyName = "מטריקס",
  dashboardUrl = "https://kesher-tov.community/",
}: TaskClosedOtherEmailProps) {
  return (
    <EmailLayout
      previewText={`עדכון לגבי בקשת הסיוע ב${companyName}`}
      heading={`תודה על הרצון הטוב, ${helperName}`}
      primaryAction={
        dashboardUrl
          ? {
              label: "ללוח הבקרה שלך ←",
              href: dashboardUrl,
            }
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        רצינו לעדכן שבקשת הסיוע עבור המשרה ב<strong>{companyName}</strong> נסגרה.
      </Text>

      <Text style={{ fontSize: "15px", color: "#6b6880", lineHeight: "1.6", marginTop: "12px" }}>
        הנעזרת כבר הסתדרה והמשימה הושלמה. תודה רבה על המוכנות לפתוח דלת ולעזור לחברות הקהילה!
      </Text>
    </EmailLayout>
  );
}

export default TaskClosedOtherEmail;
