"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BookEditModal from "@/components/BookEditModal";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book: initialBook }: BookCardProps) {
  const [book, setBook] = useState(initialBook);
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  const progressPct =
    book.word_count && book.progress !== undefined && book.progress > 0
      ? Math.round((book.progress / book.word_count) * 100)
      : null;

  function handleUpdated(updates: Partial<Book>) {
    setBook((b) => ({ ...b, ...updates }));
  }

  return (
    <>
      <div className="group relative flex flex-col rounded-xl overflow-hidden border border-[#D9CCBA] bg-[#F0E8D6] hover:shadow-md transition-shadow cursor-pointer">
        {/* Cover */}
        <div
          className="relative w-full aspect-[2/3] bg-[#E5D9C3]"
          onClick={() => router.push(`/book/${book.id}/read`)}
        >
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#9E8A72]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}

          {/* Edit button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-3" onClick={() => router.push(`/book/${book.id}/read`)}>
          <p className="text-sm font-medium text-[#2C2416] truncate">{book.title}</p>
          <p className="text-xs text-[#9E8A72] mt-0.5">
            {progressPct !== null ? `${progressPct}% read` : book.word_count ? `${book.word_count.toLocaleString()} words` : ""}
          </p>
          {progressPct !== null && (
            <div className="mt-2 w-full bg-[#E5D9C3] rounded-full h-0.5">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <BookEditModal book={book} onClose={() => setShowEdit(false)} onUpdated={handleUpdated} />
      )}
    </>
  );
}
