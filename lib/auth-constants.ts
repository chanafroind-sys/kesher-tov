export const INVITE_COOKIE_NAME = "kt_invite_code";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };
