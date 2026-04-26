"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        router.push("/pending-approval");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C2416] tracking-tight mb-1">Speed Reader</h1>
          <p className="text-[#6B5B45]">{mode === "login" ? "Sign in to your library" : "Create an account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#F0E8D6] rounded-2xl p-8 border border-[#D9CCBA] space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4A3A28] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#D9CCBA] text-[#2C2416] placeholder-[#9E8A72] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3A28] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#D9CCBA] text-[#2C2416] placeholder-[#9E8A72] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B5B45] mt-4">
          {mode === "login" ? (
            <>No account? <a href="/signup" className="text-indigo-600 hover:underline">Sign up</a></>
          ) : (
            <>Have an account? <a href="/login" className="text-indigo-600 hover:underline">Sign in</a></>
          )}
        </p>
      </div>
    </div>
  );
}
