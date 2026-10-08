import * as React from "react";
import { Text, Section, Link } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface ClaimDetailsEmailProps {
  helperName: string;
  seekerName: string;
  seekerPhone?: string | null;
  companyName: string;
  cvDownloadUrl: string;
  markDoneUrl: string;
  taskDetailsUrl?: string;
}

export function ClaimDetailsEmail({
  helperName = "מרים",
  seekerName = "שרה כהן",
  seekerPhone = "050-1234567",
  companyName = "מטריקס",
  cvDownloadUrl = "https://kesher-tov.community/cv/sample.pdf",
  markDoneUrl = "https://kesher-tov.community/a/done-token-123",
  taskDetailsUrl = "https://kesher-tov.community/tasks/123",
}: ClaimDetailsEmailProps) {
  return (
    <EmailLayout
      previewText={`פרטי הנעזרת ${seekerName} עבור משרה ב${companyName}`}
      heading={`תודה שלקחת את המשימה, ${helperName}!`}
      primaryAction={{
        label: "סיימתי: עשיתי את שלי ✓",
        href: markDoneUrl,
      }}
      secondaryAction={
        taskDetailsUrl
          ? {
              label: "לדף המשימה המלא",
              href: taskDetailsUrl,
            }
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        הנה הפרטים של <strong>{seekerName}</strong> לצורך הגשה וסיוע במשרת {companyName}:
      </Text>

      <Section
        style={{
          backgroundColor: "#fbf8f3",
          borderRadius: "16px",
          border: "1px solid #ede9e1",
          padding: "20px",
          margin: "18px 0",
        }}
      >
        <Text style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#1b1830", fontWeight: "bold" }}>
          שם הנעזרת: {seekerName}
        </Text>
        {seekerPhone && (
          <Text style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6b6880" }}>
            טלפון ליצירת קשר: <strong>{seekerPhone}</strong>
          </Text>
        )}
        <Text style={{ margin: "14px 0 0 0", fontSize: "15px" }}>
          📄{" "}
          <Link
            href={cvDownloadUrl}
            style={{
              color: "#5a20d8",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            להורדת קורות החיים המעודכנים (PDF) ←
          </Link>
        </Text>
      </Section>

      <Text style={{ fontSize: "14px", color: "#6b6880", lineHeight: "1.5" }}>
        ברגע שהגשת את קורות החיים במערכת החברה או שוחחת איתה — לחצי על הכפתור למטה כדי לעדכן אותה שהגשת.
      </Text>
    </EmailLayout>
  );
}

export default ClaimDetailsEmail;
