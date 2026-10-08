import * as React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface HiredEmailProps {
  seekerName: string;
  companyName: string;
  hiredUrl: string;
}

export function HiredEmail({
  seekerName = "שרה",
  companyName = "מטריקס",
  hiredUrl = "https://kesher-tov.community/hired",
}: HiredEmailProps) {
  return (
    <EmailLayout
      previewText={`מזל טוב ענק! בשעה טובה על הקבלה ל${companyName} 🎉`}
      heading={`קולולו! בשעה טובה, ${seekerName}! 🎊`}
      primaryAction={{
        label: "לדף הכרת הטוב ←",
        href: hiredUrl,
      }}
    >
      <Text style={{ fontSize: "17px", color: "#3a3750", lineHeight: "1.6" }}>
        שמחנו לשמוע שהתקבלת לעבודה ב<strong>{companyName}</strong>! שיהיה בהצלחה רבה, ברכה ופרנסה טובה.
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
          הקפאנו את שאר המשימות שלך. אין צורך לשלם כעת שום דבר! רק לאחר שתקבלי בעז&quot;ה
          את המשכורת הראשונה, ניצור קשר לסגירת התודה לעוזרת שפתחה לך את הדלת.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default HiredEmail;
