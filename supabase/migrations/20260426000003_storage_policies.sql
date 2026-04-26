-- Allow authenticated users to upload to epubs bucket
CREATE POLICY "Authenticated users can upload epubs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'epubs');

CREATE POLICY "Authenticated users can read epubs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'epubs');

-- Allow authenticated users to upload to covers bucket
CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Anyone can read covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can update covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can delete covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'covers');
