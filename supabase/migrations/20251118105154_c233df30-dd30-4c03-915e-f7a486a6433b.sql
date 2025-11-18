-- Create profiles table for teachers
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Teacher'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create classes table
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

alter table public.classes enable row level security;

create policy "Teachers can view their classes"
  on public.classes for select
  using (teacher_id = auth.uid());

create policy "Teachers can manage their classes"
  on public.classes for all
  using (teacher_id = auth.uid());

-- Create subjects table
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

alter table public.subjects enable row level security;

create policy "Teachers can view all subjects"
  on public.subjects for select
  using (auth.uid() is not null);

create policy "Teachers can manage their subjects"
  on public.subjects for all
  using (teacher_id = auth.uid());

-- Create students table
create table public.students (
  id uuid default gen_random_uuid() primary key,
  roll_number text not null unique,
  name text not null,
  email text,
  class_id uuid references public.classes(id) on delete set null,
  guardian_name text,
  guardian_phone text,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.students enable row level security;

create policy "Teachers can view their students"
  on public.students for select
  using (teacher_id = auth.uid());

create policy "Teachers can manage their students"
  on public.students for all
  using (teacher_id = auth.uid());

-- Create attendance table
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(student_id, date)
);

alter table public.attendance enable row level security;

create policy "Teachers can view attendance for their students"
  on public.attendance for select
  using (teacher_id = auth.uid());

create policy "Teachers can manage attendance for their students"
  on public.attendance for all
  using (teacher_id = auth.uid());

-- Create results table
create table public.results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  subject text not null,
  score integer not null check (score >= 0 and score <= 100),
  grade text,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(student_id, subject)
);

alter table public.results enable row level security;

create policy "Teachers can view results for their students"
  on public.results for select
  using (teacher_id = auth.uid());

create policy "Teachers can manage results for their students"
  on public.results for all
  using (teacher_id = auth.uid());

-- Function to auto-calculate grade
create or replace function public.calculate_grade(score integer)
returns text
language plpgsql
as $$
begin
  if score >= 90 then return 'A+';
  elsif score >= 80 then return 'A';
  elsif score >= 70 then return 'B';
  elsif score >= 60 then return 'C';
  elsif score >= 50 then return 'D';
  else return 'F';
  end if;
end;
$$;

-- Trigger to auto-update grade on results
create or replace function public.update_result_grade()
returns trigger
language plpgsql
as $$
begin
  new.grade := public.calculate_grade(new.score);
  return new;
end;
$$;

create trigger set_result_grade
  before insert or update on public.results
  for each row execute function public.update_result_grade();

-- Trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_students_updated_at
  before update on public.students
  for each row execute function public.update_updated_at_column();

create trigger update_results_updated_at
  before update on public.results
  for each row execute function public.update_updated_at_column();

-- Insert some sample subjects
insert into public.subjects (name) values
  ('Mathematics'),
  ('Science'),
  ('English'),
  ('History'),
  ('Geography');