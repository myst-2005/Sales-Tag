-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & CONSTANTS
-- -----------------------------------------------------------------------------
create type user_role as enum (
  'ceo', 
  'cfo', 
  'head_of_sales', 
  'sales_executive', 
  'data_entry', 
  'admin'
);

create type payment_type as enum ('one_time', 'emi', 'cumulative');
create type payment_mode as enum ('online', 'offline'); -- Mode for student (Online/Offline)
create type student_mode_type as enum ('online', 'offline');

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- SCHOOLS
create table public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- COURSES
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(id) not null,
  name text not null,
  created_at timestamp with time zone default now(),
  unique(school_id, name)
);

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role user_role not null default 'sales_executive',
  full_name text,
  email text,
  school_id uuid references public.schools(id), -- Optional: If a staff belongs to a specific school
  created_at timestamp with time zone default now()
);

-- STUDENTS
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null unique, -- Critical for matching
  email text not null unique,
  school_id uuid references public.schools(id) not null,
  course_id uuid references public.courses(id) not null,
  mode student_mode_type not null default 'offline',
  assigned_sales_id uuid references public.profiles(id), -- Sales Executive
  total_fee numeric(12, 2) not null default 0, -- Agreed Course Fee
  created_by uuid references public.profiles(id), -- Audit
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- PAYMENTS
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) not null,
  amount numeric(12, 2) not null check (amount > 0),
  payment_type payment_type not null default 'one_time',
  payment_date date default current_date,
  remarks text,
  created_by uuid references public.profiles(id), -- Audit: Who entered it
  created_at timestamp with time zone default now()
);

-- CAMPAIGNS
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  target_course_id uuid references public.courses(id),
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamp with time zone default now()
);

-- CAMPAIGN LEADS (From CSV)
create table public.campaign_leads (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) not null,
  phone text not null, -- Normalized
  raw_data jsonb, -- Original row data
  is_converted boolean default false,
  converted_student_id uuid references public.students(id),
  created_at timestamp with time zone default now()
);

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
alter table public.schools enable row level security;
alter table public.courses enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.payments enable row level security;

-- HELPER FUNCTION: Get current user role
create or replace function public.get_my_role()
returns user_role as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- POLICIES

-- Schools/Courses: Readable by all authenticated
create policy "Schools are viewable by everyone" on public.schools for select using (auth.role() = 'authenticated');
create policy "Courses are viewable by everyone" on public.courses for select using (auth.role() = 'authenticated');

-- Profiles:
-- Everyone can read their own profile
create policy "Users can see own profile" on public.profiles for select using (auth.uid() = id);
-- CEO/CFO/Admin/Head of Sales can view all profiles (to see sales execs)
create policy "Management can view all profiles" on public.profiles for select 
using (public.get_my_role() in ('ceo', 'cfo', 'admin', 'head_of_sales'));

-- Students:
-- 1. CEO, CFO, Admin, Head of Sales: View ALL
create policy "Management view all students" on public.students for select
using (public.get_my_role() in ('ceo', 'cfo', 'admin', 'head_of_sales'));

-- 2. Data Entry: View ALL (Needed to check duplicates/add) + INSERT
create policy "Data Entry view all students" on public.students for select
using (public.get_my_role() = 'data_entry');

create policy "Data Entry insert students" on public.students for insert
with check (public.get_my_role() = 'data_entry');

-- 3. Sales Exec: View ONLY assigned
create policy "Sales Exec view assigned students" on public.students for select
using (public.get_my_role() = 'sales_executive' and assigned_sales_id = auth.uid());

-- Payments:
-- 1. CEO, CFO (Masked?), Admin, Head of Sales: View ALL
create policy "Management view all payments" on public.payments for select
using (public.get_my_role() in ('ceo', 'cfo', 'admin', 'head_of_sales'));

-- 2. Data Entry: View ALL + INSERT
create policy "Data Entry view all payments" on public.payments for select
using (public.get_my_role() = 'data_entry');

create policy "Data Entry insert payments" on public.payments for insert
with check (public.get_my_role() = 'data_entry');

-- 3. Sales Exec: NO ACCESS to payments (Strict Requirement)
-- (No policy defined = No access)

-- -----------------------------------------------------------------------------
-- 4. SEED DATA
-- -----------------------------------------------------------------------------
-- We will insert Schools and Courses here
DO $$
DECLARE
  s_marketing uuid;
  s_design uuid;
  s_tech uuid;
  s_finance uuid;
BEGIN
  -- Create Schools
  insert into schools (name) values ('Marketing School') returning id into s_marketing;
  insert into schools (name) values ('Design School') returning id into s_design;
  insert into schools (name) values ('Tech School') returning id into s_tech;
  insert into schools (name) values ('Finance School') returning id into s_finance;

  -- Courses: Marketing
  insert into courses (school_id, name) values 
    (s_marketing, 'AI Integrated Basic to Advanced Digital Marketing'),
    (s_marketing, 'Performance Marketing Mastery'),
    (s_marketing, 'Social Media Mastery');

  -- Courses: Design
  insert into courses (school_id, name) values 
    (s_design, 'Graphic Design'),
    (s_design, 'CDC'),
    (s_design, 'Branding'),
    (s_design, 'UI/UX'),
    (s_design, 'Video Editing');

  -- Courses: Tech
  insert into courses (school_id, name) values 
    (s_tech, 'Python'),
    (s_tech, 'N8N'),
    (s_tech, 'Data Analytics'),
    (s_tech, 'Applied AI');

  -- Courses: Finance
  insert into courses (school_id, name) values 
    (s_finance, 'Advanced Practical Accounting and Financial Intelligence'),
    (s_finance, 'Advanced Taxation Course'),
    (s_finance, 'HACA Scale Up'),
    (s_finance, 'Tax Practitioner Bootcamp');
END $$;
