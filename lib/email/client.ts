import { Resend } from "resend";
import { isMockMode } from "@/lib/actions/types";
import { render } from "@react-email/components";
import type { ReactElement } from "react";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  unsubscribeUrl?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Send email via Resend with List-Unsubscribe header, or simulated send in mock/dev mode
 */
export async function sendEmail({
  to,
  subject,
  react,
  unsubscribeUrl = "https://kesher-tov.community/settings/notifications",
}: SendEmailOptions): Promise<SendEmailResult> {
  const recipients = Array.isArray(to) ? to : [to];

  // In Mock mode or when no API key is provided
  if (isMockMode() || !resend) {
    console.log(`[Email Mock] Sent "${subject}" to ${recipients.join(", ")}`);
    return { ok: true, id: `mock-email-${Date.now()}` };
  }

  try {
    const html = await render(react);
    const fromAddress = process.env.EMAIL_FROM || "קשר טוב <notifications@kesher-tov.community>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("[Email Error]", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "שגיאה בשליחת מייל";
    console.error("[Email Exception]", msg);
    return { ok: false, error: msg };
  }
}
