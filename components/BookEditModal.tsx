"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Book } from "@/types";

interface BookEditModalProps {
  book: Book;
  onClose: () => void;
  onUpdated: (updates: Partial<Book>) => void;
}

export default function BookEditModal({ book, onClose, onUpdated }: BookEditModalProps) {
  const [title, setTitle] = useState(book.title);
  const [coverUrl, setCoverUrl] = useState(book.cover_url);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function saveTitle() {
    if (title === book.title) return;
    setSavingTitle(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("books").update({ title }).eq("id", book.id);
    onUpdated({ title });
    setSavingTitle(false);
  }

  async function uploadCover(file: File) {
    setUploadingCover(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`/api/books/${book.id}/cover`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.coverUrl) {
      setCoverUrl(data.coverUrl);
      onUpdated({ cover_url: data.coverUrl });
    }
    setUploadingCover(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#FAF6EE] rounded-2xl p-6 w-full max-w-md border border-[#D9CCBA] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#2C2416]">Edit Book</h2>
          <button onClick={onClose} className="text-[#9E8A72] hover:text-[#4A3A28] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cover */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#4A3A28] mb-2">Cover Image</label>
          <div className="flex items-start gap-4">
            <div className="w-20 h-28 rounded-lg overflow-hidden bg-[#E5D9C3] border border-[#D9CCBA] flex items-center justify-center flex-shrink-0">
              {coverUrl ? (
                <Image src={coverUrl} alt={title} width={80} height={112} className="object-cover w-full h-full" unoptimized />
              ) : (
                <svg className="w-8 h-8 text-[#9E8A72]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-4 py-2 rounded-lg bg-[#E5D9C3] hover:bg-[#D9CCBA] text-[#4A3A28] text-sm font-medium transition-colors disabled:opacity-50"
              >
                {uploadingCover ? "Uploading…" : coverUrl ? "Replace image" : "Upload image"}
              </button>
              <p className="text-xs text-[#9E8A72] mt-1">JPG or PNG</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#4A3A28] mb-2">Title</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              className="flex-1 px-3 py-2 rounded-xl bg-[#F0E8D6] border border-[#D9CCBA] text-[#2C2416] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <button
              onClick={saveTitle}
              disabled={savingTitle || title === book.title}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {savingTitle ? "…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
