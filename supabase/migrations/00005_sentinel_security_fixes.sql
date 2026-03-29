-- Supabase Sentinel Security Fixes
-- Generated: 2026-03-28
-- Fixes: 2 HIGH, 2 MEDIUM findings

-- ============================================================
-- HIGH: groups UPDATE missing WITH CHECK
-- Prevents creator from changing created_by via direct API
-- ============================================================

DROP POLICY "groups_update_creator" ON groups;
CREATE POLICY "groups_update_creator"
  ON groups FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

-- ============================================================
-- HIGH: group_members UPDATE missing WITH CHECK
-- Prevents swapping student_id or status bypass via direct API
-- ============================================================

DROP POLICY "group_members_update_group_creator" ON group_members;
CREATE POLICY "group_members_update_group_creator"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
        AND created_by = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
        AND created_by = (SELECT auth.uid())
    )
  );

-- ============================================================
-- MEDIUM: get_student_product_families callable by anon
-- Revoke anonymous access — require authentication
-- ============================================================

REVOKE EXECUTE ON FUNCTION get_student_product_families() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_student_product_families() TO authenticated;

-- ============================================================
-- MEDIUM: groups and group_members SELECT open to denied users
-- Restrict to students and teachers only
-- ============================================================

DROP POLICY "groups_select_authenticated" ON groups;
CREATE POLICY "groups_select_students_teachers"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role IN ('student', 'teacher')
    )
  );

DROP POLICY "group_members_select_authenticated" ON group_members;
CREATE POLICY "group_members_select_students_teachers"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role IN ('student', 'teacher')
    )
  );
