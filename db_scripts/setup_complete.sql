-- =============================================================================
-- SALETAG - COMPLETE DATABASE SETUP SCRIPT
-- =============================================================================
-- This script sets up the entire database schema from scratch.
-- It combines tables, enums, security policies, and initial seed data.

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. ENUMS & TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    create type user_role as enum (
      'ceo', 'cfo', 'head_of_sales', 'sales_executive', 'data_entry', 'admin', 'project_lead', 'sales_team_lead'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type payment_type as enum ('one_time', 'emi', 'cumulative');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type student_mode_type as enum ('online', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 3. CORE TABLES
-- -----------------------------------------------------------------------------

-- SCHOOLS
create table if not exists public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- COURSES
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(id) not null,
  name text not null,
  created_at timestamp with time zone default now(),
  unique(school_id, name)
);

-- PROFILES (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role user_role not null default 'sales_executive',
  full_name text,
  email text,
  school_id uuid references public.schools(id),
  phone text,
  is_approved boolean default false,
  created_at timestamp with time zone default now()
);

-- STUDENTS
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null unique,
  email text not null unique,
  school_id uuid references public.schools(id) not null,
  course_id uuid references public.courses(id) not null,
  mode student_mode_type not null default 'offline',
  assigned_sales_id uuid references public.profiles(id),
  total_fee numeric(12, 2) not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- PAYMENTS
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) not null,
  amount numeric(12, 2) not null check (amount > 0),
  payment_type payment_type not null default 'one_time',
  payment_date date default current_date,
  remarks text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- CAMPAIGNS
create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  target_course_id uuid references public.courses(id),
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamp with time zone default now()
);

-- CAMPAIGN LEADS
create table if not exists public.campaign_leads (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) not null,
  phone text not null,
  raw_data jsonb,
  is_converted boolean default false,
  converted_student_id uuid references public.students(id),
  created_at timestamp with time zone default now()
);

-- SCHOOL TARGETS
create table if not exists public.school_targets (
    id uuid default gen_random_uuid() primary key,
    school_id uuid references public.schools(id) on delete cascade,
    target_month date not null,
    target_revenue numeric default 0,
    target_students integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(school_id, target_month)
);

-- USER TARGETS
create table if not exists public.user_targets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    target_month date not null,
    target_revenue numeric default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, target_month)
);

-- -----------------------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- Helper: Get current user role
create or replace function public.get_my_role()
returns user_role as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$ language plpgsql security definer;

-- Trigger: Handle new user signup (Auto-create profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_approved)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'sales_executive', false);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.schools enable row level security;
alter table public.courses enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.payments enable row level security;
alter table public.school_targets enable row level security;
alter table public.user_targets enable row level security;
alter table public.campaigns enable row level security;

-- SCHOOLS & COURSES: Readable by all
create policy "Schools viewable by everyone" on public.schools for select using (auth.role() = 'authenticated');
create policy "Courses viewable by everyone" on public.courses for select using (auth.role() = 'authenticated');

-- PROFILES:
-- View own
create policy "Users can see own profile" on public.profiles for select using (auth.uid() = id);
-- Management view all
create policy "Management view all profiles" on public.profiles for select 
using (public.get_my_role() in ('ceo', 'cfo', 'admin', 'head_of_sales', 'project_lead'));
-- Update own (limited)
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
-- Admins update approvals
create policy "Admins can update profiles" on public.profiles for update
using (public.get_my_role() in ('admin', 'ceo'));

-- STUDENTS (Using the simplified permissive model for now, to ensure access)
drop policy if exists "Enable read access for authenticated users" on public.students;
create policy "Enable read access for authenticated users" on public.students for select using (auth.role() = 'authenticated');
create policy "Enable insert access for authenticated users" on public.students for insert with check (auth.role() = 'authenticated');
create policy "Enable update access for authenticated users" on public.students for update using (auth.role() = 'authenticated');
create policy "Enable delete access for authenticated users" on public.students for delete using (auth.role() = 'authenticated');

-- PAYMENTS
create policy "Management view payments" on public.payments for select
using (public.get_my_role() in ('ceo', 'cfo', 'admin', 'head_of_sales', 'data_entry'));
create policy "Data Entry insert payments" on public.payments for insert
with check (public.get_my_role() in ('data_entry', 'admin'));

-- TARGETS
create policy "Read targets authenticated" on public.school_targets for select to authenticated using (true);
create policy "Manage targets" on public.school_targets for all to authenticated 
using (public.get_my_role() in ('head_of_sales', 'admin', 'ceo'));

create policy "Read user targets" on public.user_targets for select using (auth.role() = 'authenticated');
create policy "Manage user targets" on public.user_targets for all using (
    public.get_my_role() in ('admin', 'head_of_sales', 'project_lead', 'sales_team_lead')
);

-- -----------------------------------------------------------------------------
-- 6. SEED DATA
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  s_marketing uuid;
  s_design uuid;
  s_tech uuid;
  s_finance uuid;
BEGIN
  -- Avoid duplicates if run multiple times
  IF NOT EXISTS (SELECT 1 FROM schools LIMIT 1) THEN
      -- Create Schools
      insert into schools (name) values ('Marketing School') returning id into s_marketing;
      insert into schools (name) values ('Design School') returning id into s_design;
      insert into schools (name) values ('Tech School') returning id into s_tech;
      insert into schools (name) values ('Finance School') returning id into s_finance;

      -- Courses
      insert into courses (school_id, name) values 
        (s_marketing, 'AI Integrated Basic to Advanced Digital Marketing'),
        (s_marketing, 'Performance Marketing Mastery'),
        (s_marketing, 'Social Media Mastery');

      insert into courses (school_id, name) values 
        (s_design, 'Graphic Design'),
        (s_design, 'CDC'),
        (s_design, 'Branding'),
        (s_design, 'UI/UX'),
        (s_design, 'Video Editing');

      insert into courses (school_id, name) values 
        (s_tech, 'Python'),
        (s_tech, 'N8N'),
        (s_tech, 'Data Analytics'),
        (s_tech, 'Applied AI');

      insert into courses (school_id, name) values 
        (s_finance, 'Advanced Practical Accounting and Financial Intelligence'),
        (s_finance, 'Advanced Taxation Course'),
        (s_finance, 'HACA Scale Up'),
        (s_finance, 'Tax Practitioner Bootcamp');
  END IF;
END $$;
