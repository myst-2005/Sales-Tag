-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable pgcrypto for password hashing
create extension if not exists "pgcrypto";

DO $$
DECLARE
  new_user_id uuid := uuid_generate_v4();
BEGIN
  -- 2. Insert into auth.users
  -- This mimics a signup with a pre-verified email using bcrypt hash
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('password123', gen_salt('bf')), -- Hash the password
    now(), -- Auto confirm
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  );

  -- 3. Insert into public.profiles
  -- Assigning 'ceo' role for full access. Change to 'sales_executive' etc. to test others.
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    new_user_id,
    'ceo',
    'Mohammed Nazil',
    'mohammednazilk@myst.com'
  );

END $$;
