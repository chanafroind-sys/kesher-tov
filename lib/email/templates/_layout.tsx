import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Hr,
} from "@react-email/components";

export interface EmailLayoutProps {
  previewText?: string;
  heading?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  footerNote?: string;
}

export function EmailLayout({
  previewText,
  heading,
  children,
  primaryAction,
  secondaryAction,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{heading || "קשר טוב"}</title>
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header Brand */}
          <Section style={headerSection}>
            <Text style={logoText}>
              <span style={logoMark}>קשר</span> טוב
            </Text>
            <Text style={subHeader}>רשת עזרה הדדית בקהילה</Text>
          </Section>

          {/* Main Card */}
          <Section style={cardSection}>
            {heading && <Text style={headingText}>{heading}</Text>}

            <Section style={contentSection}>{children}</Section>

            {/* Primary Button */}
            {primaryAction && (
              <Section style={buttonContainer}>
                <Button style={primaryButtonStyle} href={primaryAction.href}>
                  {primaryAction.label}
                </Button>
              </Section>
            )}

            {/* Secondary Action Link */}
            {secondaryAction && (
              <Section style={secondaryActionContainer}>
                <Link style={secondaryLinkStyle} href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            {footerNote && <Text style={footerNoteText}>{footerNote}</Text>}
            <Text style={footerText}>
              הודעה זו נשלחה מפלטפורמת <strong>קשר טוב</strong>.
            </Text>
            <Text style={footerLinksText}>
              <Link
                style={footerLink}
                href="https://kesher-tov.community/settings/notifications"
              >
                לשינוי הגדרות התראות
              </Link>
              {" · "}
              <Link style={footerLink} href="https://kesher-tov.community">
                לאתר הקהילה
              </Link>
            </Text>
            <Hr style={footerHr} />
            <Text style={legalText}>
              בכבוד, בדיסקרטיות ובלב טוב · © 2026 קשר טוב
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ==========================================================================
   Email Styles - Optimized for Gmail, Outlook, Apple Mail, and RTL Hebrew
   ========================================================================== */
const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const mainStyle: React.CSSProperties = {
  backgroundColor: "#fbf8f3",
  fontFamily,
  padding: "24px 0",
  direction: "rtl",
  margin: 0,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "0 16px",
  direction: "rtl",
};

const headerSection: React.CSSProperties = {
  textAlign: "center",
  paddingBottom: "20px",
};

const logoText: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: "900",
  color: "#1b1830",
  margin: "0 0 4px 0",
  letterSpacing: "-0.5px",
};

const logoMark: React.CSSProperties = {
  color: "#6a2ff5",
};

const subHeader: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b6880",
  margin: "0",
  fontWeight: "500",
};

const cardSection: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  border: "1px solid #ede9e1",
  padding: "36px 32px",
  boxShadow: "0 4px 16px rgba(27, 24, 48, 0.04)",
  textAlign: "right",
  direction: "rtl",
};

const headingText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#1b1830",
  marginTop: "0",
  marginBottom: "18px",
  lineHeight: "1.3",
  textAlign: "right",
};

const contentSection: React.CSSProperties = {
  color: "#3a3750",
  fontSize: "16px",
  lineHeight: "1.6",
  textAlign: "right",
  direction: "rtl",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  marginTop: "30px",
  marginBottom: "12px",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#5a20d8",
  borderRadius: "14px",
  color: "#ffffff",
  fontSize: "17px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 36px",
  boxShadow: "0 4px 14px rgba(90, 32, 216, 0.3)",
};

const secondaryActionContainer: React.CSSProperties = {
  textAlign: "center",
  marginTop: "12px",
};

const secondaryLinkStyle: React.CSSProperties = {
  color: "#5a20d8",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "underline",
};

const footerSection: React.CSSProperties = {
  textAlign: "center",
  paddingTop: "24px",
  paddingBottom: "32px",
  direction: "rtl",
};

const footerNoteText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b6880",
  marginBottom: "12px",
};

const footerText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b6880",
  margin: "4px 0",
};

const footerLinksText: React.CSSProperties = {
  fontSize: "13px",
  margin: "8px 0",
};

const footerLink: React.CSSProperties = {
  color: "#5a20d8",
  textDecoration: "underline",
  fontWeight: "500",
};

const footerHr: React.CSSProperties = {
  borderTop: "1px solid #ede9e1",
  borderBottom: "none",
  margin: "18px auto",
  maxWidth: "240px",
};

const legalText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9995a8",
  margin: "0",
};

export default EmailLayout;
