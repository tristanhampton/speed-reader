"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0E8D6] border border-[#D9CCBA] flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#6B5B45]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#2C2416] mb-2">Awaiting Approval</h1>
        <p className="text-[#6B5B45] mb-8 leading-relaxed">
          Your account has been created and is pending approval. You'll be able to access your library once an admin approves your account.
        </p>
        <button
          onClick={signOut}
          className="text-sm text-[#9E8A72] hover:text-[#4A3A28] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
