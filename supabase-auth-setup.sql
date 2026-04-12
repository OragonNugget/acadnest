-- ============================================================
-- Trackademic: Supabase Auth Setup Migration
-- Run this in your Supabase SQL editor after enabling Google OAuth
-- ============================================================

-- 1. Enable Google OAuth in Supabase Dashboard:
--    Authentication > Providers > Google > Enable
--    Add your Google OAuth Client ID & Secret from console.cloud.google.com

-- 2. Add Authorized redirect URI in Google Console:
--    https://your-project.supabase.co/auth/v1/callback

-- 3. Add author_id columns to shared tables (forum & templates)
--    so each post/template is owned by a specific user

ALTER TABLE forum_posts
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE community_templates
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. (Optional) Enable Row Level Security on private tables.
--    The API currently enforces ownership in server-side code,
--    but RLS adds a defense-in-depth layer.

-- grade_components: only owner can CRUD
ALTER TABLE grade_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_components" ON grade_components
  FOR ALL USING (student_id::text = auth.uid()::text);

-- grade_entries: accessible only through owned components
ALTER TABLE grade_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_entries" ON grade_entries
  FOR ALL USING (
    component_id IN (
      SELECT id FROM grade_components WHERE student_id::text = auth.uid()::text
    )
  );

-- saved_grades: only owner can CRUD
ALTER TABLE saved_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_grades" ON saved_grades
  FOR ALL USING (student_id::text = auth.uid()::text);

-- student_settings: only owner can CRUD
ALTER TABLE student_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_settings" ON student_settings
  FOR ALL USING (student_id::text = auth.uid()::text);

-- gwa_entries: only owner can CRUD
ALTER TABLE gwa_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_gwa" ON gwa_entries
  FOR ALL USING (student_id::text = auth.uid()::text);

-- forum_posts: anyone can read, only author can write/delete
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_forum" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "auth_insert_forum" ON forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "owner_delete_forum" ON forum_posts FOR DELETE USING (author_id = auth.uid());

-- community_templates: anyone can read, only author can write/delete
ALTER TABLE community_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_templates" ON community_templates FOR SELECT USING (true);
CREATE POLICY "auth_insert_templates" ON community_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "owner_delete_templates" ON community_templates FOR DELETE USING (author_id = auth.uid());
