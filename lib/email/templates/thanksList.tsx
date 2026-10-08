import * as React from "react";
import { Text, Section, Button } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface ThanksItemData {
  name: string;
  companyName: string;
  amount: number;
  paymentType: string;
  paymentDetails?: string;
  markPaidUrl: string;
}

export interface ThanksListEmailProps {
  seekerName: string;
  helpers: ThanksItemData[];
  hiredDashboardUrl?: string;
}

export function ThanksListEmail({
  seekerName = "שרה",
  helpers = [
    {
      name: "מרים לוי",
      companyName: "מטריקס",
      amount: 100,
      paymentType: "העברה בנקאית",
      paymentDetails: "בנק לאומי (10), סניף 800, חשבון 456789",
      markPaidUrl: "https://kesher-tov.community/a/paid-123",
    },
  ],
  hiredDashboardUrl = "https://kesher-tov.community/hired",
}: ThanksListEmailProps) {
  return (
    <EmailLayout
      previewText="פרטי התודה לעוזרות שפתחו לך את הדלת"
      heading={`סגירת מעגל התודה, ${seekerName}`}
      primaryAction={
        hiredDashboardUrl
          ? {
              label: "לדף ניהול התודות באתר ←",
              href: hiredDashboardUrl,
            }
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        הנה פרטי התשלום שהעוזרות הגדירו לצורך העברת דמי התודה:
      </Text>

      {helpers.map((h, idx) => (
        <Section
          key={idx}
          style={{
            backgroundColor: "#fbf8f3",
            borderRadius: "16px",
            border: "1px solid #ede9e1",
            padding: "20px",
            margin: "16px 0",
            textAlign: "right",
          }}
        >
          <Text style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "bold", color: "#1b1830" }}>
            {h.name} · {h.companyName} ({h.amount > 0 ? `₪${h.amount}` : "חסד"})
          </Text>
          <Text style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#5a20d8", fontWeight: "bold" }}>
            אופן התשלום: {h.paymentType}
          </Text>
          {h.paymentDetails && (
            <Text style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#6b6880" }}>
              פרטים: {h.paymentDetails}
            </Text>
          )}

          <Button
            href={h.markPaidUrl}
            style={{
              backgroundColor: "#1b1830",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "bold",
              borderRadius: "10px",
              padding: "10px 18px",
              textDecoration: "none",
            }}
          >
            אישור: העברתי את התודה ✓
          </Button>
        </Section>
      ))}
    </EmailLayout>
  );
}

export default ThanksListEmail;
