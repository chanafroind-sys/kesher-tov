import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface HelperMarkedDoneEmailProps {
  seekerName: string;
  helperName: string;
  companyName: string;
  closeTaskUrl: string;
  notYetUrl?: string;
}

export function HelperMarkedDoneEmail({
  seekerName = "שרה",
  helperName = "מרים",
  companyName = "מטריקס",
  closeTaskUrl = "https://kesher-tov.community/tasks/123",
  notYetUrl = "https://kesher-tov.community/a/not-yet-123",
}: HelperMarkedDoneEmailProps) {
  return (
    <EmailLayout
      previewText={`${helperName} סיימה לסייע במשרת ${companyName}!`}
      heading={`העוזרת עדכנה שהיא הגישה!`}
      primaryAction={{
        label: "כן, היא עזרה – לסגירת המשימה ←",
        href: closeTaskUrl,
      }}
      secondaryAction={
        notYetUrl
          ? {
              label: "עוד לא / עדיין בתהליך",
              href: notYetUrl,
            }
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        שלום {seekerName}, העוזרת <strong>{helperName}</strong> סימנה שהיא סיימה את חלקה עבור המשרה ב<strong>{companyName}</strong>.
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
        <Text style={{ margin: "0", fontSize: "14px", color: "#6b6880", lineHeight: "1.6" }}>
          האם הסיוע הושלם לשביעות רצונך? אם כן, אנא סגרי את המשימה ובחרי בה כעוזרת שסייעה לך.
          אין תשלום כעת — דמי התודה ייכנסו לתוקף רק כשתתקבלי ותקבלי משכורת ראשונה בעז&quot;ה.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default HelperMarkedDoneEmail;
