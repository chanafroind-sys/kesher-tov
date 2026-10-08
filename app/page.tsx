import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "./(app)/layout";
import { AppDashboard } from "@/components/dashboard/AppDashboard";
import { LandingPage } from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get("kt_session")?.value;

  let isAuthenticated = !!hasSession;

  if (!isAuthenticated) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
      }
    } catch {
      // Offline fallback
    }
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <AppDashboard />
      </AppLayout>
    );
  }

  return <LandingPage />;
}
