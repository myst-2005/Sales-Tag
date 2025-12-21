-- RUN THIS AFTER SIGNING UP
-- This will find the user by email, Approve them, and make them Admin.

UPDATE public.profiles
SET 
  role = 'admin',
  is_approved = true
WHERE email = 'mohammednazilk@harisandcoacademy.com';
