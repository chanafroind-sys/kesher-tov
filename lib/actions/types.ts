export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function isMockMode(): boolean {
  return process.env.USE_MOCKS === "1";
}

export function notImplementedError(): { ok: false; error: string } {
  return { ok: false, error: "not implemented" };
}
