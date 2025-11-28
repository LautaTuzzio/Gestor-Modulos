/*
  # Update RLS Policies to Allow All Access
  
  ## Changes
  This migration removes all restrictive RLS policies and replaces them with permissive policies that allow all authenticated users full access to all tables.
  
  ## Security Note
  All authenticated users will have full SELECT, INSERT, UPDATE, and DELETE permissions on:
  - subjects
  - teachers
  - teacher_subjects
  - user_roles
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all subjects" ON subjects;
DROP POLICY IF EXISTS "Teachers can view all subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can insert subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can update subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can delete subjects" ON subjects;

DROP POLICY IF EXISTS "Admins can view all teachers" ON teachers;
DROP POLICY IF EXISTS "Teachers can view their own data" ON teachers;
DROP POLICY IF EXISTS "Admins can insert teachers" ON teachers;
DROP POLICY IF EXISTS "Admins can update all teacher data" ON teachers;
DROP POLICY IF EXISTS "Teachers can update their basic data" ON teachers;
DROP POLICY IF EXISTS "Only admins can delete teachers" ON teachers;

DROP POLICY IF EXISTS "Admins can view all assignments" ON teacher_subjects;
DROP POLICY IF EXISTS "Teachers can view their own assignments" ON teacher_subjects;
DROP POLICY IF EXISTS "Admins can insert assignments" ON teacher_subjects;
DROP POLICY IF EXISTS "Admins can update assignments" ON teacher_subjects;
DROP POLICY IF EXISTS "Admins can delete assignments" ON teacher_subjects;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Create permissive policies for subjects table
CREATE POLICY "Allow all SELECT on subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all INSERT on subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (true);

-- Create permissive policies for teachers table
CREATE POLICY "Allow all SELECT on teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all INSERT on teachers"
  ON teachers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on teachers"
  ON teachers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on teachers"
  ON teachers FOR DELETE
  TO authenticated
  USING (true);

-- Create permissive policies for teacher_subjects table
CREATE POLICY "Allow all SELECT on teacher_subjects"
  ON teacher_subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all INSERT on teacher_subjects"
  ON teacher_subjects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on teacher_subjects"
  ON teacher_subjects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on teacher_subjects"
  ON teacher_subjects FOR DELETE
  TO authenticated
  USING (true);

-- Create permissive policies for user_roles table
CREATE POLICY "Allow all SELECT on user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all INSERT on user_roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on user_roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on user_roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (true);
