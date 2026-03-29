-- Security fix: replace available_students view with a SECURITY DEFINER function
-- that verifies the caller is a student or teacher before returning results.
-- Denied users cannot access student data.

-- Remove the view and its grant
DROP VIEW IF EXISTS available_students;

-- Create a function that checks caller role
CREATE OR REPLACE FUNCTION search_available_students(search_query text)
RETURNS TABLE(id uuid, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only students and teachers can search for students
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
