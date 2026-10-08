# Mutual-help platform - rules for Claude Code

## Stack
Next.js 16 (App Router, TypeScript strict) · Tailwind v4 (RTL, Hebrew UI) · Supabase (Postgres + RLS, Auth OTP, Storage, Edge Functions, pg_cron) · Resend + React Email · Vercel.
Spec: docs/architecture.md - read the relevant section before coding.
Next.js 16 has breaking changes vs. older versions (e.g. `middleware.ts` is now `proxy.ts`). See AGENTS.md and `node_modules/next/dist/docs/` before writing Next.js code.

## Folder ownership (do not edit files outside your task's folders)
- OWNER only: supabase/migrations, supabase/functions, lib/db, lib/actions, lib/tokens, types/database.ts, app/layout.tsx, app/globals.css (Tailwind v4 theme - replaces tailwind.config.ts), proxy.ts (replaces middleware.ts in Next.js 16), package.json, package-lock.json, .github/
- JUNIOR: components/**, app/(app)/**/page.tsx, lib/email/templates, supabase/seed, tests/e2e
If the task needs a change in a folder you don't own: STOP and write what's needed in the PR description instead.

## Conventions
- Server Actions in lib/actions/<feature>.ts; they return { ok: true, data } | { ok: false, error }.
- All DB access through lib/db; never call supabase from components directly.
- UI text in Hebrew, code/identifiers in English. RTL: use logical Tailwind classes (ms-, me-, ps-, pe-, start-, end-).
- Desktop-first: users work on a computer browser (most have no smartphone). Large clear text and buttons. No images of people. No external fonts/CDNs except Google Fonts (Heebo).
- Every user-facing state has: loading, empty, error.
- Design tokens (colors, shadows, animations) live in app/globals.css under @theme. Use them (e.g. bg-brand-600, text-ink-900, shadow-soft) instead of raw hex values.

## Before you finish
npm run lint && npm run typecheck && npm test - all green. Then commit on the task branch and open a PR with gh pr create, describing what changed and how to test, and include "Closes #<issue number>".
