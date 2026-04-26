export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          is_approved: boolean;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          is_approved?: boolean;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_approved?: boolean;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          epub_path: string;
          cover_url: string | null;
          word_count: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          epub_path: string;
          cover_url?: string | null;
          word_count?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          epub_path?: string;
          cover_url?: string | null;
          word_count?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          word_index: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          word_index: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          word_index?: number;
          updated_at?: string;
        };
      };
    };
  };
};
