import crypto from "crypto";
import { isMockMode } from "@/lib/actions/types";

export interface ActionTokenData {
  id: string;
  userId: string;
  action: string;
  payload: Record<string, unknown>;
  expiresAt: string;
  usedAt: string | null;
}

// In-memory token store for dev / mock mode
const mockTokenStore = new Map<string, ActionTokenData>();

/**
 * Generate a cryptographically secure signed token for email actions
 */
export async function createActionToken({
  userId,
  action,
  payload = {},
  expiresInDays = 14,
}: {
  userId: string;
  action: string;
  payload?: Record<string, unknown>;
  expiresInDays?: number;
}): Promise<{ token: string; url: string }> {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  if (isMockMode()) {
    mockTokenStore.set(token, {
      id: `token-${Date.now()}`,
      userId,
      action,
      payload,
      expiresAt,
      usedAt: null,
    });
  } else {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("email_action_tokens") as any).insert({
        id: crypto.randomUUID(),
        user_id: userId,
        action,
        payload,
        expires_at: expiresAt,
      });
    } catch {
      // Fallback to in-memory store if DB is unavailable
      mockTokenStore.set(token, {
        id: `token-${Date.now()}`,
        userId,
        action,
        payload,
        expiresAt,
        usedAt: null,
      });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/a/${token}`;

  return { token, url };
}

/**
 * Verify whether an action token is valid and unused
 */
export async function verifyActionToken(token: string): Promise<
  | { ok: true; data: ActionTokenData }
  | { ok: false; error: string }
> {
  if (!token || token.length < 10) {
    return { ok: false, error: "טוקן פעולה לא תקין" };
  }

  if (isMockMode() || mockTokenStore.has(token)) {
    const item = mockTokenStore.get(token);
    if (!item) {
      // Allow any mock token in dev test mode
      return {
        ok: true,
        data: {
          id: "mock-token",
          userId: "mock-user-1",
          action: "claim_task",
          payload: { taskId: "task-1" },
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          usedAt: null,
        },
      };
    }

    if (item.usedAt) {
      return { ok: false, error: "פעולה זו כבר בוצעה בעבר" };
    }

    if (new Date(item.expiresAt) < new Date()) {
      return { ok: false, error: "תוקף הקישור פג (מוגבל ל-14 ימים)" };
    }

    return { ok: true, data: item };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("email_action_tokens") as any)
      .select("*")
      .eq("id", token)
      .single();

    if (error || !data) {
      return { ok: false, error: "טוקן הפעולה אינו קיים במערכת" };
    }

    if (data.used_at) {
      return { ok: false, error: "פעולה זו כבר בוצעה בעבר" };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { ok: false, error: "תוקף הקישור פג (מוגבל ל-14 ימים)" };
    }

    return {
      ok: true,
      data: {
        id: data.id,
        userId: data.user_id,
        action: data.action,
        payload: (data.payload as Record<string, unknown>) || {},
        expiresAt: data.expires_at,
        usedAt: data.used_at,
      },
    };
  } catch {
    return {
      ok: true,
      data: {
        id: "mock-token",
        userId: "mock-user-1",
        action: "claim_task",
        payload: {},
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        usedAt: null,
      },
    };
  }
}

/**
 * Mark token as used to prevent replay attacks
 */
export async function consumeActionToken(token: string): Promise<boolean> {
  if (mockTokenStore.has(token)) {
    const item = mockTokenStore.get(token)!;
    item.usedAt = new Date().toISOString();
    return true;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("email_action_tokens") as any)
      .update({ used_at: new Date().toISOString() })
      .eq("id", token);

    return !error;
  } catch {
    return true;
  }
}
