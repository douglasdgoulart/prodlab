-- Fix: REVOKE from PUBLIC (not just anon) on RPC functions
-- PUBLIC grant allows all roles including anon to call the function

REVOKE EXECUTE ON FUNCTION get_student_product_families() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_student_product_families() TO authenticated;

REVOKE EXECUTE ON FUNCTION search_available_students(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_available_students(text) TO authenticated;
