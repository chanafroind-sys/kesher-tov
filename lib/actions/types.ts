export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function isMockMode(): boolean {
  return (
    process.env.USE_MOCKS === "1" ||
    !process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY.includes("your-supabase") ||
    !process.env.SUPABASE_URL ||
    process.env.SUPABASE_URL.includes("your-supabase")
  );
}

export function notImplementedError(): { ok: false; error: string } {
  return { ok: false, error: "not implemented" };
}
