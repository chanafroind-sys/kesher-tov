import Link from "next/link";
import { redirect } from "next/navigation";
import { validateInvite, setInviteCookie } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  const res = await validateInvite(code);

  if (!res.ok) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white border border-rose-200 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-rose-700 mb-4">קישור ההזמנה אינו תקף</h1>
          <p className="text-slate-600 mb-6">{res.error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </main>
    );
  }

  // Store code in cookie and redirect to login
  await setInviteCookie(code);
  redirect(`/login?invitedBy=${encodeURIComponent(res.data.inviterName)}`);
}
