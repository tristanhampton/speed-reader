"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookCard from "@/components/BookCard";
import type { Book } from "@/types";

interface LibraryViewProps {
  books: Book[];
  isAdmin: boolean;
}

export default function LibraryView({ books: initialBooks, isAdmin }: LibraryViewProps) {
  const [books, setBooks] = useState(initialBooks);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".epub")) {
      setUploadError("Please select an .epub file");
      return;
    }
    setUploadError(null);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("epub", file);
      const res = await fetch("/api/books", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
      setBooks((prev) => [data.book, ...prev]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Header */}
      <header className="border-b border-[#D9CCBA] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2C2416]">My Library</h1>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <a
              href="/admin"
              className="text-sm text-[#6B5B45] hover:text-[#2C2416] transition-colors"
            >
              Admin
            </a>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Parsing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Upload EPUB
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".epub"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <SignOutButton />
        </div>
      </header>

      <main className="px-6 py-8">
        {uploadError && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">{uploadError}</p>
          </div>
        )}

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0E8D6] border border-[#D9CCBA] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#9E8A72]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-[#4A3A28] font-medium mb-1">No books yet</p>
            <p className="text-[#9E8A72] text-sm">Upload an EPUB to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={signOut} className="text-sm text-[#9E8A72] hover:text-[#4A3A28] transition-colors">
      Sign out
    </button>
  );
}
