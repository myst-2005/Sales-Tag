-- ⚠️ DANGER: THIS DELETES ALL USERS AND PROFILES
-- USE WITH CAUTION

BEGIN;

-- 1. Unlink dependencies (Students, Payments) so deletion doesn't fail
-- We set references to NULL instead of deleting data, to save your records.
UPDATE public.students SET assigned_sales_id = NULL, created_by = NULL;
UPDATE public.payments SET created_by = NULL;

-- 2. Delete all users from Supabase Auth
-- This will CASCADE and delete public.profiles automatically.
DELETE FROM auth.users;

COMMIT;
