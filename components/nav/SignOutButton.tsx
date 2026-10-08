"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="text-xs font-semibold text-ink-500 hover:text-rose-600 transition px-2 py-1 rounded-lg hover:bg-rose-50"
      title="יציאה מהחשבון"
    >
      {isPending ? "יוצא..." : "יציאה"}
    </button>
  );
}
