import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { parseEpub } from "@/lib/parseEpub";
import ReaderView from "@/components/ReaderView";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch book metadata
  const { data: book } = await supabase
    .from("books")
    .select("id, title, epub_path")
    .eq("id", id)
    .single();
  if (!book) notFound();

  // Fetch reading progress
  const { data: progressRow } = await supabase
    .from("reading_progress")
    .select("word_index")
    .eq("user_id", user.id)
    .eq("book_id", id)
    .maybeSingle();

  // Download EPUB from private storage using service client
  const service = createServiceClient();
  const { data: epubBlob, error: downloadError } = await service.storage
    .from("epubs")
    .download(book.epub_path);

  if (downloadError || !epubBlob) {
    throw new Error(`Failed to download EPUB: ${downloadError?.message}`);
  }

  const arrayBuffer = await epubBlob.arrayBuffer();
  const { words } = await parseEpub(arrayBuffer, book.title);

  return (
    <ReaderView
      words={words}
      title={book.title}
      bookId={book.id}
      userId={user.id}
      initialIndex={progressRow?.word_index ?? 0}
    />
  );
}
