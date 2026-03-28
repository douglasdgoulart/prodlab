-- ============================================================
-- Migration: revert scoped SELECT policies that caused 42P17
-- (infinite recursion on class_members self-referential check)
-- ============================================================

-- Restore: groups SELECT for students and teachers
DROP POLICY IF EXISTS "groups_select_own_class_or_teacher" ON groups;
DROP POLICY IF EXISTS "groups_select_students_teachers" ON groups;
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
DROP POLICY IF EXISTS "group_members_select_students_teachers" ON group_members;
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
DROP POLICY IF EXISTS "classes_select_students_teachers" ON classes;
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
DROP POLICY IF EXISTS "class_members_select_students_teachers" ON class_members;
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
