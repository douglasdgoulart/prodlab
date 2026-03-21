-- Supabase Sentinel Security Fixes
-- Generated: 2026-03-21

-- Fix 1: Corrigir policy SELECT — usar (SELECT auth.uid()) e restringir para authenticated
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Fix 2: Corrigir handle_new_user — adicionar SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.email LIKE '%@al.unieduk.com.br' THEN 'student'
      WHEN NEW.email LIKE '%@prof.unieduk.com.br' THEN 'teacher'
      ELSE 'denied'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 3: Revogar acesso direto à função do trigger
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Fix 4: Auto-enable RLS em tabelas futuras
CREATE OR REPLACE FUNCTION public.auto_enable_rls()
RETURNS event_trigger AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag = 'CREATE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', obj.object_identity);
    RAISE NOTICE 'RLS auto-enabled on %', obj.object_identity;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'auto_enable_rls_trigger') THEN
    CREATE EVENT TRIGGER auto_enable_rls_trigger
      ON ddl_command_end
      WHEN TAG IN ('CREATE TABLE')
      EXECUTE FUNCTION public.auto_enable_rls();
  END IF;
END;
$$;
