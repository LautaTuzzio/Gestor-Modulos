/*
  # Sistema de Gestión de Docentes - Base de Datos
  
  ## Descripción General
  Este sistema permite el registro, modificación y gestión de docentes con control de acceso basado en roles.
  
  ## 1. Nuevas Tablas
  
  ### `subjects` - Materias
  - `id` (uuid, primary key): Identificador único de la materia
  - `name` (text): Nombre de la materia
  - `code` (text): Código de la materia
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Fecha de última actualización
  
  ### `teachers` - Docentes
  - `id` (uuid, primary key): Identificador único del docente
  - `user_id` (uuid, foreign key): Referencia al usuario en auth.users
  - `first_name` (text): Nombre del docente
  - `last_name` (text): Apellido del docente
  - `dni` (text, unique): DNI del docente
  - `email` (text, unique): Email de contacto
  - `phone` (text): Teléfono de contacto
  - `employment_status` (text): Estado laboral (titular, provisional, suplente)
  - `is_active` (boolean): Estado activo/inactivo (para baja lógica)
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Fecha de última actualización
  - `created_by` (uuid): Usuario que creó el registro
  
  ### `teacher_subjects` - Relación Docentes-Materias
  - `id` (uuid, primary key): Identificador único
  - `teacher_id` (uuid, foreign key): Referencia al docente
  - `subject_id` (uuid, foreign key): Referencia a la materia
  - `assigned_at` (timestamptz): Fecha de asignación
  - `assigned_by` (uuid): Usuario que asignó la materia
  
  ### `user_roles` - Roles de Usuario
  - `id` (uuid, primary key): Identificador único
  - `user_id` (uuid, foreign key): Referencia al usuario
  - `role` (text): Rol del usuario (admin, teacher)
  - `created_at` (timestamptz): Fecha de creación
  
  ## 2. Seguridad (RLS)
  
  ### Políticas de Seguridad por Tabla:
  
  #### `subjects`
  - Administradores: lectura, creación, actualización, eliminación
  - Docentes: solo lectura
  
  #### `teachers`
  - Administradores: acceso completo
  - Docentes: pueden ver su propia información y modificar datos básicos
  - Solo administradores pueden dar de baja docentes
  
  #### `teacher_subjects`
  - Administradores: acceso completo
  - Docentes: pueden ver sus propias asignaciones
  
  #### `user_roles`
  - Solo lectura para usuarios autenticados (para verificar permisos)
  - Solo administradores pueden modificar roles
  
  ## 3. Funciones Auxiliares
  
  - `is_admin()`: Verifica si el usuario actual es administrador
  - `is_teacher_owner()`: Verifica si el usuario es el dueño del registro de docente
  
  ## 4. Notas Importantes
  
  - Todos los docentes son también usuarios del sistema
  - La baja de docentes es lógica (campo `is_active`)
  - Solo administradores pueden realizar bajas
  - Los docentes pueden actualizar datos personales básicos
  - La asignación de materias es manejada por administradores
  - Se mantiene auditoría de quién creó y asignó registros
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dni text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  employment_status text NOT NULL CHECK (employment_status IN ('titular', 'provisional', 'suplente')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create teacher_subjects junction table
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE(teacher_id, subject_id)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_dni ON teachers(dni);
CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON teachers(is_active);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON teacher_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is the teacher owner
CREATE OR REPLACE FUNCTION is_teacher_owner(teacher_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() = teacher_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for subjects table
CREATE POLICY "Admins can view all subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Teachers can view all subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'teacher'
    )
  );

CREATE POLICY "Admins can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (is_admin());

-- Policies for teachers table
CREATE POLICY "Admins can view all teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Teachers can view their own data"
  ON teachers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert teachers"
  ON teachers FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update all teacher data"
  ON teachers FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Teachers can update their basic data"
  ON teachers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    -- Teachers can only update these fields
    (SELECT t.employment_status FROM teachers t WHERE t.id = teachers.id) = employment_status AND
    (SELECT t.is_active FROM teachers t WHERE t.id = teachers.id) = is_active AND
    (SELECT t.created_by FROM teachers t WHERE t.id = teachers.id) = created_by
  );

CREATE POLICY "Only admins can delete teachers"
  ON teachers FOR DELETE
  TO authenticated
  USING (is_admin());

-- Policies for teacher_subjects table
CREATE POLICY "Admins can view all assignments"
  ON teacher_subjects FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Teachers can view their own assignments"
  ON teacher_subjects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = teacher_subjects.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert assignments"
  ON teacher_subjects FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update assignments"
  ON teacher_subjects FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete assignments"
  ON teacher_subjects FOR DELETE
  TO authenticated
  USING (is_admin());

-- Policies for user_roles table
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (is_admin());