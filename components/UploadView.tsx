"use client";

import { useRef, useState } from "react";

interface UploadViewProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export default function UploadView({ onUpload, isLoading, error }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".epub")) {
      alert("Please select an .epub file");
      return;
    }
    onUpload(file);
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2C2416] tracking-tight mb-2">Speed Reader</h1>
          <p className="text-[#6B5B45] text-lg">Upload an EPUB and read at the speed of thought</p>
        </div>

        <div
          className={`
            relative rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer
            transition-all duration-150 select-none
            ${isDragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
              : "border-[#D9CCBA] bg-[#F0E8D6] hover:border-[#B8A890] hover:bg-[#E8DCC8]"
            }
            ${isLoading ? "pointer-events-none opacity-60" : ""}
          `}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".epub"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[#4A3A28] text-lg font-medium">Parsing EPUB…</p>
              <p className="text-[#9E8A72] text-sm">This may take a moment for large books</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#E5D9C3] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#6B5B45]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
              </div>
              <div>
                <p className="text-[#2C2416] text-xl font-medium mb-1">
                  {isDragging ? "Drop it here" : "Drop your EPUB here"}
                </p>
                <p className="text-[#6B5B45]">or click to browse</p>
              </div>
              <p className="text-[#9E8A72] text-sm">.epub files only · max 50 MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
