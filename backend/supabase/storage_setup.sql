-- ============================================
-- CarWise - Storage Bucket Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- Create storage bucket for garage media (logos + photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('garage-media', 'garage-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload garage media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'garage-media' AND auth.uid() IS NOT NULL);

-- Allow public access to view files
CREATE POLICY "Public can view garage media"
ON storage.objects FOR SELECT
USING (bucket_id = 'garage-media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update garage media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'garage-media' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete garage media"
ON storage.objects FOR DELETE
USING (bucket_id = 'garage-media' AND auth.uid() IS NOT NULL);
