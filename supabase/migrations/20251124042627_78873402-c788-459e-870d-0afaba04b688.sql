-- Extend students table with additional profile fields
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS genotype TEXT,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS state_of_origin TEXT,
ADD COLUMN IF NOT EXISTS class_teacher_name TEXT,
ADD COLUMN IF NOT EXISTS town TEXT,
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS parent_email TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT;

-- Create staff table with extended profile fields
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  class_taught TEXT,
  rank TEXT,
  staff_type TEXT CHECK (staff_type IN ('teaching_staff', 'non_teaching_staff')),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  state_of_origin TEXT,
  hobbies TEXT,
  resident_address TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')),
  age INTEGER,
  account_number TEXT,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Add staff role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND 'staff' = ANY(enum_range(NULL::app_role)::text[])) THEN
    ALTER TYPE app_role ADD VALUE 'staff';
  END IF;
END $$;

-- RLS Policies for staff table
CREATE POLICY "Admins can manage all staff"
ON public.staff
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view their own profile"
ON public.staff
FOR SELECT
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update their own profile"
ON public.staff
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Update trigger for staff
CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();