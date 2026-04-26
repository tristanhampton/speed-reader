export interface Chapter {
  title: string;
  startIndex: number;
}

export interface ParseResponse {
  words: string[];
  title: string;
  wordCount: number;
  chapters: Chapter[];
  cover?: { buffer: Buffer; mimeType: string };
  error?: string;
}

export type AppView = "upload" | "reader";

export interface Book {
  id: string;
  title: string;
  epub_path: string;
  cover_url: string | null;
  word_count: number | null;
  uploaded_by: string | null;
  created_at: string;
  progress?: number; // word_index for current user
}

export interface Profile {
  id: string;
  email: string;
  is_approved: boolean;
  is_admin: boolean;
  created_at: string;
}
