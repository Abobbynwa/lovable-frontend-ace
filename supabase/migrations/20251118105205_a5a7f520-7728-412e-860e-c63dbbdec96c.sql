-- Fix search_path for calculate_grade function
create or replace function public.calculate_grade(score integer)
returns text
language plpgsql
stable
set search_path = public
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

-- Fix search_path for update_result_grade function
create or replace function public.update_result_grade()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.grade := public.calculate_grade(new.score);
  return new;
end;
$$;

-- Fix search_path for update_updated_at_column function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;