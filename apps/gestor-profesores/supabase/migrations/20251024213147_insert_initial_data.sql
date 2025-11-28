-- Migration to insert initial data into the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert sample subjects
INSERT INTO public.subjects (id, name, code, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), 'Matemáticas', 'MATH-101', now(), now()),
  (uuid_generate_v4(), 'Física', 'PHYS-201', now(), now()),
  (uuid_generate_v4(), 'Química', 'CHEM-101', now(), now()),
  (uuid_generate_v4(), 'Historia', 'HIST-101', now(), now()),
  (uuid_generate_v4(), 'Literatura', 'LIT-101', now(), now());

-- Create a function to create a teacher with auth user and role
CREATE OR REPLACE FUNCTION create_teacher_with_auth(
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_dni text,
  p_phone text,
  p_employment_status text,
  p_role text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_teacher_id uuid;
  v_role_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')), -- Encrypt password
    now(),
    now(),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- Create teacher profile
  INSERT INTO public.teachers (
    id,
    user_id,
    first_name,
    last_name,
    dni,
    email,
    phone,
    employment_status,
    is_active,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    uuid_generate_v4(),
    v_user_id,
    p_first_name,
    p_last_name,
    p_dni,
    p_email,
    p_phone,
    p_employment_status,
    true,
    now(),
    now(),
    v_user_id
  )
  RETURNING id INTO v_teacher_id;

  -- Assign role
  INSERT INTO public.user_roles (
    id,
    user_id,
    role,
    created_at
  ) VALUES (
    uuid_generate_v4(),
    v_user_id,
    p_role,
    now()
  )
  RETURNING id INTO v_role_id;

  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin user (password: admin123)
SELECT create_teacher_with_auth(
  'admin@instituto.edu',
  'admin123',
  'Admin',
  'Sistema',
  '12345678',
  '+541112345678',
  'titular',
  'admin'
);

-- Create sample teachers (passwords are the same as their emails without @...)
SELECT create_teacher_with_auth(
  'juan.perez@instituto.edu',
  'juan.perez',
  'Juan',
  'Pérez',
  '30123456',
  '+541112345679',
  'titular',
  'teacher'
);

SELECT create_teacher_with_auth(
  'maria.gonzalez@instituto.edu',
  'maria.gonzalez',
  'María',
  'González',
  '29123456',
  '+541112345680',
  'provisional',
  'teacher'
);

-- Assign subjects to teachers
DO $$
DECLARE
  v_math_id uuid;
  v_physics_id uuid;
  v_chem_id uuid;
  v_hist_id uuid;
  v_lit_id uuid;
  v_juan_id uuid;
  v_maria_id uuid;
BEGIN
  -- Get subject IDs
  SELECT id INTO v_math_id FROM public.subjects WHERE code = 'MATH-101';
  SELECT id INTO v_physics_id FROM public.subjects WHERE code = 'PHYS-201';
  SELECT id INTO v_chem_id FROM public.subjects WHERE code = 'CHEM-101';
  SELECT id INTO v_hist_id FROM public.subjects WHERE code = 'HIST-101';
  SELECT id INTO v_lit_id FROM public.subjects WHERE code = 'LIT-101';
  
  -- Get teacher IDs
  SELECT id INTO v_juan_id FROM public.teachers WHERE dni = '30123456';
  SELECT id INTO v_maria_id FROM public.teachers WHERE dni = '29123456';
  
  -- Assign subjects to Juan Pérez
  INSERT INTO public.teacher_subjects (id, teacher_id, subject_id, assigned_at, assigned_by)
  VALUES 
    (uuid_generate_v4(), v_juan_id, v_math_id, now(), (SELECT id FROM auth.users WHERE email = 'admin@instituto.edu')),
    (uuid_generate_v4(), v_juan_id, v_physics_id, now(), (SELECT id FROM auth.users WHERE email = 'admin@instituto.edu'));
    
  -- Assign subjects to María González
  INSERT INTO public.teacher_subjects (id, teacher_id, subject_id, assigned_at, assigned_by)
  VALUES 
    (uuid_generate_v4(), v_maria_id, v_chem_id, now(), (SELECT id FROM auth.users WHERE email = 'admin@instituto.edu')),
    (uuid_generate_v4(), v_maria_id, v_hist_id, now(), (SELECT id FROM auth.users WHERE email = 'admin@instituto.edu')),
    (uuid_generate_v4(), v_maria_id, v_lit_id, now(), (SELECT id FROM auth.users WHERE email = 'admin@instituto.edu'));
END $$;
