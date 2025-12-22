-- RUN THIS IN SQL EDITOR *AFTER* SIGNING UP
-- This sets the user as approved and makes them an Admin.

UPDATE public.profiles
SET 
  role = 'admin',
  is_approved = true
WHERE email = 'mohammednazilk@harisandcoacademy.com';

-- Verify it worked
SELECT email, role, is_approved FROM public.profiles 
WHERE email = 'mohammednazilk@harisandcoacademy.com';
