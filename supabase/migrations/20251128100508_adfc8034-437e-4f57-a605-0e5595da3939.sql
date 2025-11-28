-- Fix #1: Create SECURITY DEFINER helper functions to break RLS infinite recursion

-- Helper function to check if user is a student's guardian
CREATE OR REPLACE FUNCTION public.is_student_guardian(_guardian_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM student_guardians
    WHERE student_id = _student_id
    AND guardian_id = _guardian_id
  );
$$;

-- Helper function to check if student belongs to teacher
CREATE OR REPLACE FUNCTION public.is_teacher_student(_teacher_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM students
    WHERE id = _student_id
    AND teacher_id = _teacher_id
  );
$$;

-- Drop and recreate problematic policies using helper functions
DROP POLICY IF EXISTS "Parents can view their children" ON students;
CREATE POLICY "Parents can view their children" ON students
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'parent') AND
  is_student_guardian(auth.uid(), id)
);

DROP POLICY IF EXISTS "Teachers can manage guardian relationships for their students" ON student_guardians;
CREATE POLICY "Teachers can manage guardian relationships for their students" ON student_guardians
FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  is_teacher_student(auth.uid(), student_id)
);

-- Fix #2: Add RLS policies to verification_tokens table

-- Block all non-service-role access
CREATE POLICY "Service role only access" ON verification_tokens
FOR ALL
USING (false);

-- Add automatic cleanup of expired tokens
CREATE OR REPLACE FUNCTION public.delete_expired_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM verification_tokens
  WHERE expires_at < NOW();
  RETURN NULL;
END;
$$;

CREATE TRIGGER cleanup_expired_tokens
AFTER INSERT ON verification_tokens
EXECUTE FUNCTION delete_expired_tokens();