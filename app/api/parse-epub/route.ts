import { NextRequest, NextResponse } from "next/server";
import { parseEpub } from "@/lib/parseEpub";

export async function POST(req: NextRequest) {
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
    const result = await parseEpub(buffer, file.name);
    return NextResponse.json(result);
  } catch (err) {
    console.error("EPUB parse error:", err);
    return NextResponse.json({ error: "Failed to parse EPUB file" }, { status: 500 });
  }
}
