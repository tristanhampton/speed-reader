"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";

interface AdminUserRowProps {
  user: Profile;
  isLast: boolean;
}

export default function AdminUserRow({ user, isLast }: AdminUserRowProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: !user.is_approved }),
    });
    router.refresh();
  }

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 bg-[#F0E8D6] ${
        !isLast ? "border-b border-[#D9CCBA]" : ""
      }`}
    >
      <div>
        <p className="text-sm font-medium text-[#2C2416]">{user.email}</p>
        <p className="text-xs text-[#9E8A72]">
          Joined {new Date(user.created_at).toLocaleDateString()}
          {user.is_admin && " · Admin"}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          user.is_approved
            ? "bg-[#E5D9C3] hover:bg-[#D9CCBA] text-[#4A3A28]"
            : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
      >
        {loading ? "…" : user.is_approved ? "Revoke" : "Approve"}
      </button>
    </div>
  );
}
