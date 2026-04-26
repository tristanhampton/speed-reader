import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership or admin
  const { data: book } = await supabase
    .from("books")
    .select("uploaded_by")
    .eq("id", bookId)
    .single();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
  if (book.uploaded_by !== user.id && !profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const image = formData.get("image") as File | null;
  if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  const ext = image.type.includes("png") ? "png" : "jpg";
  const coverPath = `${bookId}-custom.${ext}`;
  const buffer = Buffer.from(await image.arrayBuffer());

  // Upsert (overwrite if exists)
  await supabase.storage.from("covers").remove([coverPath]);
  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(coverPath, buffer, { contentType: image.type });
  if (uploadError) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(coverPath);

  await supabase.from("books").update({ cover_url: publicUrl }).eq("id", bookId);

  return NextResponse.json({ coverUrl: publicUrl });
}
