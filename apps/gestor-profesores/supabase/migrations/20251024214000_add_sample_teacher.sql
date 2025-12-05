-- Migration to add a sample teacher

-- First, let's create a function to handle the teacher creation
CREATE OR REPLACE FUNCTION create_teacher_with_auth(
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_dni text,
  p_phone text,
  p_employment_status text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_teacher_id uuid;
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
    updated_at
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
    now()
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
    gen_random_uuid(),
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

  -- Assign teacher role
  INSERT INTO public.user_roles (
    id,
    user_id,
    role,
    created_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    'teacher',
    now()
  );

  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql;

-- Add a sample teacher
SELECT create_teacher_with_auth(
  'profesor@ejemplo.com', -- email
  'password123',          -- password (in a real app, this should be more secure)
  'Juan',                 -- first_name
  'Pérez',               -- last_name
  '12345678',            -- dni
  '+5491122334455',      -- phone
  'titular'              -- employment_status
);

-- Add an admin user as well
SELECT create_teacher_with_auth(
  'admin@ejemplo.com',   -- email
  'admin123',            -- password (in a real app, this should be more secure)
  'Admin',               -- first_name
  'Sistema',             -- last_name
  '87654321',            -- dni
  '+5491188776655',      -- phone
  'titular'              -- employment_status
);

-- Update the admin user's role
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@ejemplo.com');

-- Create a function to get user by DNI for login
CREATE OR REPLACE FUNCTION get_user_by_dni(p_dni text)
RETURNS TABLE (
  id uuid,
  email text,
  encrypted_password text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.encrypted_password
  FROM auth.users u
  JOIN public.teachers t ON u.id = t.user_id
  WHERE t.dni = p_dni AND t.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
