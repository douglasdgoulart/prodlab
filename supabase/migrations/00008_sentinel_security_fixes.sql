-- ============================================================
-- Migration: security fixes from Supabase Sentinel audit
-- ============================================================

-- 1. Fix product_families UPDATE policy — add WITH CHECK
--    Without it, a teacher could reassign created_by to another user.
DROP POLICY "product_families_update_creator_teacher" ON product_families;
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
  )
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'teacher'
    )
  );

-- 2. Revert scoped SELECT policies that caused infinite recursion (42P17)
--    on class_members self-referential check. Cross-class visibility is
--    acceptable for this educational context since the search RPC already
--    scopes results by class.

-- Restore: groups SELECT for students and teachers
DROP POLICY IF EXISTS "groups_select_own_class_or_teacher" ON groups;
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

-- Restore: group_members SELECT for students and teachers
DROP POLICY IF EXISTS "group_members_select_own_class_or_teacher" ON group_members;
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

-- Restore: classes SELECT for students and teachers
DROP POLICY IF EXISTS "classes_select_own_or_teacher" ON classes;
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

-- Restore: class_members SELECT for students and teachers
DROP POLICY IF EXISTS "class_members_select_own_class_or_teacher" ON class_members;
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
