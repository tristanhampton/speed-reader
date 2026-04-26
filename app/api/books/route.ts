import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseEpub } from "@/lib/parseEpub";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("epub") as File | null;

  if (!file || !file.name.toLowerCase().endsWith(".epub")) {
    return NextResponse.json({ error: "Please upload a valid .epub file" }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (50 MB max)" }, { status: 413 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const { words, title, wordCount, cover } = await parseEpub(buffer, file.name);

    const bookId = randomUUID();
    const epubPath = `${bookId}.epub`;

    // Upload EPUB to storage
    const { error: epubUploadError } = await supabase.storage
      .from("epubs")
      .upload(epubPath, Buffer.from(buffer), { contentType: "application/epub+zip" });
    if (epubUploadError) throw new Error(`Storage upload failed: ${epubUploadError.message}`);

    // Upload cover if found
    let coverUrl: string | null = null;
    if (cover) {
      const ext = cover.mimeType.includes("png") ? "png" : "jpg";
      const coverPath = `${bookId}.${ext}`;
      const { error: coverError } = await supabase.storage
        .from("covers")
        .upload(coverPath, cover.buffer, { contentType: cover.mimeType });
      if (!coverError) {
        const { data } = supabase.storage.from("covers").getPublicUrl(coverPath);
        coverUrl = data.publicUrl;
      }
    }

    // Insert book record
    const { data: book, error: dbError } = await supabase
      .from("books")
      .insert({
        id: bookId,
        title,
        epub_path: epubPath,
        cover_url: coverUrl,
        word_count: wordCount,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

    return NextResponse.json({ book, wordCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Book upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
