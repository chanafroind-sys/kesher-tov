import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface ThanksReceivedEmailProps {
  helperName: string;
  seekerName: string;
  amount: number;
  note?: string | null;
  dashboardUrl?: string;
}

export function ThanksReceivedEmail({
  helperName = "מרים",
  seekerName = "שרה כהן",
  amount = 100,
  note = "מרים היקרה, תודה ענקית על הכל! בזכותך התקבלתי לעבודה ואני מודה לך מכל הלב.",
  dashboardUrl = "https://kesher-tov.community/",
}: ThanksReceivedEmailProps) {
  return (
    <EmailLayout
      previewText={`${seekerName} העבירה לך תודה אישית ומכתב הערכה! 💐`}
      heading={`תודה חמה מ${seekerName}! 💖`}
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
        שלום {helperName}, <strong>{seekerName}</strong> קיבלה משכורת ראשונה וסגרה את מעגל התודה על עזרתך!
        {amount > 0 && ` דמי תודה בסך ₪${amount} הועברו לפי הנחיותיך.`}
      </Text>

      {note && (
        <Section
          style={{
            backgroundColor: "#fbf8f3",
            borderRadius: "16px",
            border: "1px solid #ede9e1",
            padding: "20px",
            margin: "20px 0",
            fontStyle: "italic",
          }}
        >
          <Text style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b6880", fontStyle: "normal", fontWeight: "bold" }}>
            מכתב תודה אישי עבורך:
          </Text>
          <Text style={{ margin: "0", fontSize: "15px", color: "#1b1830", lineHeight: "1.6" }}>
            &quot;{note}&quot;
          </Text>
        </Section>
      )}

      <Text style={{ fontSize: "14px", color: "#6b6880", lineHeight: "1.5" }}>
        אשריך שזכית להיות השליחה הטובה שפתחה לה את הדלת לעבודה ולפרנסה!
      </Text>
    </EmailLayout>
  );
}

export default ThanksReceivedEmail;
