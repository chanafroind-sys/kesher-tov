import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface ClaimedYourTaskEmailProps {
  seekerName: string;
  companyName: string;
  taskUrl: string;
}

export function ClaimedYourTaskEmail({
  seekerName = "שרה",
  companyName = "מטריקס",
  taskUrl = "https://kesher-tov.community/tasks/123",
}: ClaimedYourTaskEmailProps) {
  return (
    <EmailLayout
      previewText={`חדשות מעולות: עוזרת לקחה את המשימה שלך ב${companyName}!`}
      heading={`חדשות טובות, ${seekerName}!`}
      primaryAction={{
        label: "לצפייה בסטטוס המשימה ←",
        href: taskUrl,
      }}
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        עובדת מ<strong>{companyName}</strong> לקחה את בקשת העזרה שלך!
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
          העוזרת קיבלה את קורות החיים שלך ותבדוק הגשה פנימית לחברה.
          ברגע שהיא תסמן שהגישה או סייעה, תקבלי עדכון מיידי.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default ClaimedYourTaskEmail;
