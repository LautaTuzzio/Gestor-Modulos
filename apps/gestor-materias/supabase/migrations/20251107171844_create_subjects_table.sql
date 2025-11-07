/*
  # Create subjects table for CRUD management

  1. New Tables
    - `subjects`
      - `id` (uuid, primary key) - Unique identifier for each subject
      - `name` (text, not null) - Name of the subject
      - `code` (text, unique, not null) - Unique code for the subject
      - `created_at` (timestamptz) - Timestamp when the subject was created
      - `updated_at` (timestamptz) - Timestamp when the subject was last updated

  2. Security
    - Enable RLS on `subjects` table
    - Add policy for public read access to all subjects
    - Add policy for public insert access
    - Add policy for public update access
    - Add policy for public delete access

  Note: For this simple CRUD demo, we're allowing public access. In production,
  these policies should be restricted to authenticated users with proper roles.
*/

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subjects"
  ON subjects
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to subjects"
  ON subjects
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to subjects"
  ON subjects
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to subjects"
  ON subjects
  FOR DELETE
  TO anon
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();