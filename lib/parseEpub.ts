import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import EPub from "epub2";
import type { ParseResponse, Chapter } from "@/types";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractCover(
  epub: EPub
): Promise<{ buffer: Buffer; mimeType: string } | undefined> {
  try {
    const meta = epub.metadata as Record<string, string>;
    const images = epub.listImage();
    const target =
      (meta.cover ? images.find((i) => i.id === meta.cover) : undefined) ??
      images.find((i) => /cover/i.test((i.id ?? "") + (i.href ?? ""))) ??
      images[0];
    if (!target?.id) return undefined;
    const [buffer, mimeType] = await epub.getImageAsync(target.id);
    return { buffer, mimeType };
  } catch {
    return undefined;
  }
}

export async function parseEpub(
  buffer: ArrayBuffer,
  filename: string
): Promise<ParseResponse> {
  const tmpPath = join("/tmp", `${randomUUID()}.epub`);

  try {
    await writeFile(tmpPath, Buffer.from(buffer));

    const epub = new EPub(tmpPath);

    await new Promise<void>((resolve, reject) => {
      epub.on("end", resolve);
      epub.on("error", reject);
      epub.parse();
    });

    const title =
      (epub.metadata as Record<string, string>)?.title ??
      filename.replace(/\.epub$/i, "");

    const flowChapters = epub.flow ?? [];
    const allWords: string[] = [];
    const chapters: Chapter[] = [];

    for (const flowChapter of flowChapters) {
      if (!flowChapter.id) continue;
      try {
        const html = await new Promise<string>((resolve, reject) => {
          epub.getChapter(flowChapter.id as string, (err: Error, text?: string) => {
            if (err) reject(err);
            else resolve(text ?? "");
          });
        });
        const plain = stripHtml(html);
        const chapterWords = plain.split(/\s+/).filter((w) => w.length > 0);
        if (chapterWords.length === 0) continue;

        chapters.push({
          title: flowChapter.title ?? `Chapter ${chapters.length + 1}`,
          startIndex: allWords.length,
        });
        allWords.push(...chapterWords);
      } catch {
        // skip unreadable chapters
      }
    }

    const cover = await extractCover(epub);

    return { words: allWords, title, wordCount: allWords.length, chapters, cover };
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
