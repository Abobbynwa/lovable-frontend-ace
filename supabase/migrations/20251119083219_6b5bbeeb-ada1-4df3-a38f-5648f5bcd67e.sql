-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'parent', 'student');

-- Create user_roles table for proper role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add email_verified columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token TEXT,
  ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create student_guardians junction table FIRST (before policies reference it)
CREATE TABLE IF NOT EXISTS public.student_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, guardian_id)
);

ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- RLS for student_guardians
CREATE POLICY "Guardians can view their relationships"
  ON public.student_guardians
  FOR SELECT
  USING (guardian_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage guardian relationships for their students"
  ON public.student_guardians
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    student_id IN (SELECT id FROM public.students WHERE teacher_id = auth.uid())
  );

-- Update handle_new_user to assign teacher role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, email, email_verified)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    COALESCE(new.email_confirmed_at IS NOT NULL, false)
  );
  
  -- Assign default teacher role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'teacher');
  
  RETURN new;
END;
$$;

-- Fix students table RLS - only allow access to own students
DROP POLICY IF EXISTS "Teachers can view their students" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage their students" ON public.students;

CREATE POLICY "Teachers can view their own students"
  ON public.students
  FOR SELECT
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their own students"
  ON public.students
  FOR ALL
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view their children"
  ON public.students
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'parent') AND
    id IN (
      SELECT student_id 
      FROM public.student_guardians 
      WHERE guardian_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own profile"
  ON public.students
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'student') AND
    id = auth.uid()
  );

-- Fix attendance RLS - verify student ownership
DROP POLICY IF EXISTS "Teachers can view attendance for their students" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance for their students" ON public.attendance;

CREATE POLICY "Teachers and parents can view attendance"
  ON public.attendance
  FOR SELECT
  USING (
    teacher_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    (
      public.has_role(auth.uid(), 'parent') AND
      student_id IN (
        SELECT student_id 
        FROM public.student_guardians 
        WHERE guardian_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can manage attendance for own students"
  ON public.attendance
  FOR ALL
  USING (
    teacher_id = auth.uid() AND
    student_id IN (
      SELECT id FROM public.students WHERE teacher_id = auth.uid()
    )
  );

-- Fix results RLS - verify student ownership
DROP POLICY IF EXISTS "Teachers can view results for their students" ON public.results;
DROP POLICY IF EXISTS "Teachers can manage results for their students" ON public.results;

CREATE POLICY "Teachers and parents can view results"
  ON public.results
  FOR SELECT
  USING (
    teacher_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    (
      public.has_role(auth.uid(), 'parent') AND
      student_id IN (
        SELECT student_id 
        FROM public.student_guardians 
        WHERE guardian_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can manage results for own students"
  ON public.results
  FOR ALL
  USING (
    teacher_id = auth.uid() AND
    student_id IN (
      SELECT id FROM public.students WHERE teacher_id = auth.uid()
    )
  );

-- Fix subjects RLS - only assigned teachers and admins
DROP POLICY IF EXISTS "Teachers can view all subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can manage their subjects" ON public.subjects;

CREATE POLICY "Teachers can view assigned subjects"
  ON public.subjects
  FOR SELECT
  USING (
    teacher_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teachers can manage their own subjects"
  ON public.subjects
  FOR ALL
  USING (
    teacher_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON public.attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_results_teacher_id ON public.results(teacher_id);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_student_id ON public.student_guardians(student_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian_id ON public.student_guardians(guardian_id);