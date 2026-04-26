"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ReaderViewProps {
  words: string[];
  title: string;
  bookId: string;
  userId: string;
  initialIndex: number;
}

type FontChoice = "sans" | "serif" | "mono";

const MIN_WPM = 100;
const MAX_WPM = 1000;
const DEFAULT_WPM = 300;
const SAVE_DEBOUNCE_MS = 2000;

const fontFamilies: Record<FontChoice, string> = {
  sans: "var(--font-geist-sans)",
  serif: "var(--font-lora)",
  mono: "var(--font-courier-prime)",
};

const fontLabels: Record<FontChoice, string> = {
  sans: "Sans",
  serif: "Serif",
  mono: "Mono",
};

function AnchoredWord({ word, className, style }: { word: string; className?: string; style?: React.CSSProperties }) {
  if (!word) return null;
  const anchorIdx = Math.floor((word.length - 1) / 2);
  return (
    <div className={`flex items-baseline w-full ${className ?? ""}`} style={style}>
      <span className="flex-1 text-right">{word.slice(0, anchorIdx)}</span>
      <span className="text-red-500">{word[anchorIdx]}</span>
      <span className="flex-1 text-left">{word.slice(anchorIdx + 1)}</span>
    </div>
  );
}

export default function ReaderView({ words, title, bookId, userId, initialIndex }: ReaderViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [font, setFont] = useState<FontChoice>("sans");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialIndex);
  const router = useRouter();

  async function saveProgress(index: number) {
    if (index === lastSavedRef.current) return;
    lastSavedRef.current = index;
    const supabase = createClient();
    await supabase.from("reading_progress").upsert(
      { user_id: userId, book_id: bookId, word_index: index, updated_at: new Date().toISOString() },
      { onConflict: "user_id,book_id" }
    );
  }

  function scheduleSave(index: number) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveProgress(index), SAVE_DEBOUNCE_MS);
  }

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveProgress(currentIndex);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev >= words.length - 1 ? prev : prev + 1;
        if (next >= words.length - 1) setIsPlaying(false);
        scheduleSave(next);
        return next;
      });
    }, Math.round(60000 / wpm));

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, wpm, words.length]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLButtonElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (!isPlaying) setCurrentIndex((p) => { const n = Math.min(p + 1, words.length - 1); scheduleSave(n); return n; });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (!isPlaying) setCurrentIndex((p) => { const n = Math.max(p - 1, 0); scheduleSave(n); return n; });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, words.length]);

  function adjustWpm(delta: number) {
    setWpm((w) => Math.min(MAX_WPM, Math.max(MIN_WPM, w + delta)));
  }

  const progress = words.length > 1 ? (currentIndex / (words.length - 1)) * 100 : 0;
  const currentWord = words[currentIndex] ?? "";
  const isFinished = currentIndex >= words.length - 1 && !isPlaying;

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#D9CCBA]">
        <button
          onClick={() => { saveProgress(currentIndex); router.push("/"); }}
          className="flex items-center gap-2 text-[#6B5B45] hover:text-[#2C2416] transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Library
        </button>
        <h1 className="text-[#6B5B45] text-sm font-medium truncate max-w-xs">{title}</h1>
        <div className="text-[#9E8A72] text-sm font-mono w-20 text-right">
          {currentIndex + 1} / {words.length}
        </div>
      </header>

      {/* Word display */}
      <main className="flex-1 flex items-center justify-center px-8">
        {isFinished && currentIndex > 0 ? (
          <div className="text-center">
            <p className="text-[#6B5B45] text-2xl mb-2">Finished</p>
            <p className="text-[#9E8A72] text-base">{words.length.toLocaleString()} words</p>
          </div>
        ) : (
          <AnchoredWord
            key={currentIndex}
            word={currentWord}
            className="text-[#2C2416] font-medium text-[clamp(2.5rem,8vw,7rem)] leading-none tracking-tight animate-word-in"
            style={{ fontFamily: fontFamilies[font] }}
          />
        )}
      </main>

      {/* Controls */}
      <footer className="px-6 pb-8 pt-4 space-y-4">
        <div className="w-full bg-[#E5D9C3] rounded-full h-1 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-1">
            {[-50, -10].map((delta) => (
              <button key={delta} onClick={() => adjustWpm(delta)}
                className="px-3 py-2 rounded-lg bg-[#E5D9C3] hover:bg-[#D9CCBA] text-[#4A3A28] text-sm font-mono transition-colors">
                {delta}
              </button>
            ))}
          </div>

          <button onClick={() => setIsPlaying((p) => !p)}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-indigo-200">
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="w-6 h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          <div className="flex items-center gap-1">
            {[10, 50].map((delta) => (
              <button key={delta} onClick={() => adjustWpm(delta)}
                className="px-3 py-2 rounded-lg bg-[#E5D9C3] hover:bg-[#D9CCBA] text-[#4A3A28] text-sm font-mono transition-colors">
                +{delta}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-[#4A3A28] text-sm font-mono font-semibold">{wpm} WPM</span>

          <div className="flex items-center gap-1">
            {(["sans", "serif", "mono"] as FontChoice[]).map((f) => (
              <button key={f} onClick={() => setFont(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  font === f ? "bg-[#D9CCBA] text-[#2C2416]" : "text-[#9E8A72] hover:text-[#4A3A28] hover:bg-[#EDE5D4]"
                }`}
                style={{ fontFamily: fontFamilies[f] }}>
                {fontLabels[f]}
              </button>
            ))}
          </div>

          <span className="text-[#9E8A72] text-xs">Space to play/pause · ← → to step</span>
        </div>
      </footer>
    </div>
  );
}
