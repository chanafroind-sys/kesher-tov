import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface FirstSalaryQuestionEmailProps {
  seekerName: string;
  companyName: string;
  yesSalaryUrl: string;
  notYetUrl?: string;
}

export function FirstSalaryQuestionEmail({
  seekerName = "שרה",
  companyName = "מטריקס",
  yesSalaryUrl = "https://kesher-tov.community/a/salary-yes-123",
  notYetUrl = "https://kesher-tov.community/a/salary-notyet-123",
}: FirstSalaryQuestionEmailProps) {
  return (
    <EmailLayout
      previewText={`בדיקה חמה: האם כבר קיבלת משכורת ראשונה ב${companyName}?`}
      heading={`שלום ${seekerName}, איך הולך בעבודה החדשה?`}
      primaryAction={{
        label: "כן, קיבלתי משכורת ראשונה! להצגת התודות ←",
        href: yesSalaryUrl,
      }}
      secondaryAction={
        notYetUrl
          ? {
              label: "עוד לא / נעדכן בחודש הבא",
              href: notYetUrl,
            }
          : undefined
      }
    >
      <Text style={{ fontSize: "16px", color: "#3a3750", lineHeight: "1.6" }}>
        עבר כחודש מאז שהתחלת לעבוד ב<strong>{companyName}</strong>, ואנחנו מקווים שאת נהנית ומשתלבת נהדר!
      </Text>

      <Text style={{ fontSize: "15px", color: "#6b6880", lineHeight: "1.6", marginTop: "14px" }}>
        אם המשכורת הראשונה כבר נכנסה לחשבונך, זה הזמן לסגור מעגל ולהודות לעוזרת שפתחה לך את הדלת.
        לחיצה על הכפתור תחשוף את פרטי התשלום שהעוזרת בחרה.
      </Text>
    </EmailLayout>
  );
}

export default FirstSalaryQuestionEmail;
