-- ============================================================
-- Migration: add classes (turmas) concept
-- ============================================================

-- 1. Classes table
CREATE TABLE classes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_select_students_teachers"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role IN ('student', 'teacher')
    )
  );

CREATE POLICY "classes_insert_teachers"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'teacher'
    )
  );

CREATE POLICY "classes_update_creator"
  ON classes FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

-- 2. Class members table
CREATE TABLE class_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (class_id, student_id)
);

ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "class_members_select_students_teachers"
  ON class_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role IN ('student', 'teacher')
    )
  );

CREATE POLICY "class_members_insert_class_owner"
  ON class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_id
        AND created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "class_members_delete_class_owner"
  ON class_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = class_id
        AND created_by = (SELECT auth.uid())
    )
  );

-- 3. Add class_id to groups
-- Delete existing groups (dev environment, no production data)
DELETE FROM group_members;
DELETE FROM groups;

ALTER TABLE groups ADD COLUMN class_id uuid NOT NULL REFERENCES classes(id);

-- Update groups INSERT policy to verify class membership
DROP POLICY "groups_insert_own" ON groups;
CREATE POLICY "groups_insert_own"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM class_members
      WHERE class_id = groups.class_id
        AND student_id = (SELECT auth.uid())
    )
  );

-- 4. Update search_available_students RPC to filter by class
CREATE OR REPLACE FUNCTION search_available_students(search_query text, p_class_id uuid)
RETURNS TABLE(id uuid, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only students and teachers can search
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('student', 'teacher')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT p.id, p.full_name
  FROM profiles p
  INNER JOIN class_members cm ON cm.student_id = p.id AND cm.class_id = p_class_id
  WHERE p.role = 'student'
    AND p.full_name ILIKE '%' || search_query || '%'
    AND p.id NOT IN (
      SELECT gm.student_id
      FROM group_members gm
      WHERE gm.status = 'confirmed'
    )
    AND p.id NOT IN (
      SELECT gm.student_id
      FROM group_members gm
      WHERE gm.status = 'reserved'
        AND gm.reserved_at > now() - interval '10 minutes'
    )
  ORDER BY p.full_name
  LIMIT 10;
END;
$$;

-- Drop old 1-parameter version
DROP FUNCTION IF EXISTS search_available_students(text);

-- Revoke public, grant only to authenticated
REVOKE EXECUTE ON FUNCTION search_available_students(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_available_students(text, uuid) TO authenticated;
