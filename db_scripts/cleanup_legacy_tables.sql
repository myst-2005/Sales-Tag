-- =============================================================================
-- CLEANUP LEGACY/INCOMPATIBLE TABLES
-- =============================================================================
-- The database seems to have some tables using 'bigint' for IDs (e.g., outdated 'students' table),
-- while the new application uses 'UUIDs'. This causes Foreign Key errors.
--
-- This script DROPS the conflicting tables so 'setup_complete.sql' can recreate them correctly.
--
-- WARNING: This will delete data in these tables. 
-- =============================================================================

DROP TABLE IF EXISTS public.user_targets CASCADE;
DROP TABLE IF EXISTS public.school_targets CASCADE;
DROP TABLE IF EXISTS public.campaign_leads CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;

-- We also drop courses and schools to ensure they are recreated as UUID if they were bigint.
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- Profiles is correctly UUID (linked to auth.users), so we generally keep it 
-- unless you want a full wipe. We'll leave it for now to preserve user roles.
-- DROP TABLE IF EXISTS public.profiles CASCADE;
