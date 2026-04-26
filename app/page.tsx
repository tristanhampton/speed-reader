import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LibraryView from "@/components/LibraryView";
import type { Book } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const [{ data: books }, { data: progressRows }] = await Promise.all([
    supabase.from("books").select("*").order("created_at", { ascending: false }),
    supabase.from("reading_progress").select("book_id, word_index").eq("user_id", user.id),
  ]);

  const progressMap = new Map(
    (progressRows ?? []).map((p) => [p.book_id, p.word_index])
  );

  const booksWithProgress: Book[] = (books ?? []).map((b) => ({
    ...b,
    progress: progressMap.get(b.id),
  }));

  return (
    <LibraryView
      books={booksWithProgress}
      isAdmin={profile?.is_admin ?? false}
    />
  );
}
