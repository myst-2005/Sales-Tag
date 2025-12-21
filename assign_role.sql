-- UPSERT (Insert or Update if exists)
-- Replace 'PASTE_USER_UID_HERE' with the real ID.

INSERT INTO public.profiles (id, role, full_name, email)
VALUES (
  'PASTE_USER_UID_HERE',
  'admin',
  'Mohammed Nazil',
  'mohammednazilk@myst.com'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;
