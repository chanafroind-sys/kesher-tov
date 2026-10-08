import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface YouWereChosenEmailProps {
  helperName: string;
  seekerName: string;
  companyName: string;
  thanksAmount: number;
  dashboardUrl?: string;
}

export function YouWereChosenEmail({
  helperName = "מרים",
  seekerName = "שרה כהן",
  companyName = "מטריקס",
  thanksAmount = 100,
  dashboardUrl = "https://kesher-tov.community/",
}: YouWereChosenEmailProps) {
  return (
    <EmailLayout
      previewText={`יישר כח! נבחרת כעוזרת שפתחה את הדלת ב${companyName}`}
      heading={`יישר כח גדול, ${helperName}!`}
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
        <strong>{seekerName}</strong> סגרה את המשימה ובחרה בך כעוזרת המרכזית שסייעה לה בהגשה ל<strong>{companyName}</strong>!
      </Text>

      <Section
        style={{
          backgroundColor: "#fbf8f3",
          borderRadius: "16px",
          border: "1px solid #ede9e1",
          padding: "18px",
          margin: "18px 0",
        }}
      >
        <Text style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#1b1830", fontWeight: "bold" }}>
          דמי תודה רשומים: {thanksAmount > 0 ? `₪${thanksAmount}` : "חסד (ללא תמורה)"}
        </Text>
        <Text style={{ margin: "0", fontSize: "13px", color: "#6b6880", lineHeight: "1.5" }}>
          כאשר היא תתקבל לעבודה ותקבל משכורת ראשונה בעז&quot;ה, היא תיצור קשר להעברת התודה לפי העדפתך.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default YouWereChosenEmail;
