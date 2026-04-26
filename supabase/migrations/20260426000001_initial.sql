-- Profiles (extends auth.users, auto-created on signup)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Books
CREATE TABLE books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  epub_path   TEXT NOT NULL,         -- storage path: epubs/{uuid}.epub
  cover_url   TEXT,                  -- public URL from covers bucket
  word_count  INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX books_uploaded_by_idx ON books(uploaded_by);

-- Reading progress (one row per user per book)
CREATE TABLE reading_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  word_index  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

CREATE INDEX reading_progress_user_id_idx ON reading_progress(user_id);

-- Row Level Security
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE books           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own row; service role handles admin operations
CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- Books: approved users can read all books; authenticated users can insert/update/delete their own
CREATE POLICY "Approved users can read books"
  ON books FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = true));

CREATE POLICY "Authenticated users can upload books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Uploaders can update their books"
  ON books FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can delete their books"
  ON books FOR DELETE
  USING (uploaded_by = auth.uid());

-- Reading progress: users manage their own rows only
CREATE POLICY "Users can manage their own reading progress"
  ON reading_progress FOR ALL USING (user_id = auth.uid());

-- Storage buckets are created in the Supabase dashboard:
--   epubs   (private) — stores uploaded .epub files
--   covers  (public)  — stores cover images
