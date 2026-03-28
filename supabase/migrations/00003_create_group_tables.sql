-- Migration: create group registration tables
-- Tables: product_families, groups, group_members
-- View: available_students
-- RLS policies for all tables

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE product_families (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  trend_type       text NOT NULL CHECK (trend_type IN ('seasonal','growth','decline','stable','seasonal_growth','seasonal_decline')),
  created_by       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE groups (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        text,
  product_family_id   uuid REFERENCES product_families(id) ON DELETE SET NULL,
  status              text NOT NULL DEFAULT 'forming' CHECK (status IN ('forming','complete')),
  created_by          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE group_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id   uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','confirmed')),
  reserved_at  timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- VIEW: available_students
-- Returns students not in any confirmed group and not in an
-- active reservation (reserved within the last 10 minutes)
-- ============================================================

CREATE OR REPLACE VIEW available_students AS
SELECT id, full_name
FROM profiles
WHERE role = 'student'
  AND id NOT IN (
    SELECT student_id
    FROM group_members
    WHERE status = 'confirmed'
  )
  AND id NOT IN (
    SELECT student_id
    FROM group_members
    WHERE status = 'reserved'
      AND reserved_at > now() - interval '10 minutes'
  );

-- ============================================================
-- FUNCTION: get_student_product_families
-- Students must NOT see trend_type — it's pedagogical data
-- revealed during exercises. This SECURITY DEFINER function
-- bypasses RLS and returns only id + name.
-- ============================================================

CREATE OR REPLACE FUNCTION get_student_product_families()
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name FROM product_families ORDER BY name;
$$;

-- ============================================================
-- RLS: product_families
-- Only teachers can read the full table (includes trend_type).
-- Students access product families through the function above.
-- ============================================================

ALTER TABLE product_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_families_select_teachers"
  ON product_families FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'teacher'
    )
  );

CREATE POLICY "product_families_insert_teachers"
  ON product_families FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'teacher'
    )
  );

CREATE POLICY "product_families_update_creator_teacher"
  ON product_families FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'teacher'
    )
  );

-- ============================================================
-- RLS: groups
-- ============================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select_authenticated"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "groups_insert_own"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "groups_update_creator"
  ON groups FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()));

-- ============================================================
-- RLS: group_members
-- ============================================================

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_members_select_authenticated"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "group_members_insert_group_creator"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
        AND created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "group_members_update_group_creator"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
        AND created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "group_members_delete_group_creator"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
        AND created_by = (SELECT auth.uid())
    )
  );

-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT ON available_students TO authenticated;
