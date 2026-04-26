import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import AdminUserRow from "@/components/AdminUserRow";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/");

  const service = createServiceClient();
  const { data: allUsers } = await service
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const pending = allUsers?.filter((u) => !u.is_approved) ?? [];
  const approved = allUsers?.filter((u) => u.is_approved) ?? [];

  return (
    <div className="min-h-screen bg-[#FAF6EE] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#2C2416]">Admin Panel</h1>
          <a href="/" className="text-sm text-[#6B5B45] hover:text-[#2C2416] transition-colors">← Library</a>
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#9E8A72] uppercase tracking-wider mb-3">
            Pending Approval ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-[#9E8A72] text-sm">No pending users.</p>
          ) : (
            <div className="rounded-xl border border-[#D9CCBA] overflow-hidden">
              {pending.map((u, i) => (
                <AdminUserRow key={u.id} user={u} isLast={i === pending.length - 1} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[#9E8A72] uppercase tracking-wider mb-3">
            Approved Users ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <p className="text-[#9E8A72] text-sm">No approved users yet.</p>
          ) : (
            <div className="rounded-xl border border-[#D9CCBA] overflow-hidden">
              {approved.map((u, i) => (
                <AdminUserRow key={u.id} user={u} isLast={i === approved.length - 1} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
