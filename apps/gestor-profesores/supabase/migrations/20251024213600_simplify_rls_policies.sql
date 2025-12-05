-- Migration to simplify RLS policies to a single permissive policy per table
-- that allows all operations for authenticated users

-- Drop all existing policies
DO $$
DECLARE
  r RECORD;
  table_name TEXT;
  policy_name TEXT;
  policies_dropped INT := 0;
  tables_to_process TEXT[] := ARRAY['subjects', 'teachers', 'teacher_subjects', 'user_roles'];
BEGIN
  -- Drop all existing policies on target tables
  FOREACH table_name IN ARRAY tables_to_process LOOP
    FOR policy_name IN 
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
      policies_dropped := policies_dropped + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Dropped % policies', policies_dropped;
END $$;

-- Create a single permissive policy for each table
CREATE POLICY "Allow all operations" ON public.subjects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON public.teachers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON public.teacher_subjects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
