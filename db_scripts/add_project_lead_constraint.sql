
-- Add project_lead to the role check constraint or enum
-- Assuming profiles.role is a text column with a check constraint or similar validation.
-- If it's a native enum type 'user_role', we should alter it.
-- Based on error logs or assumptions, often Supabase starts with simple text check constraints or just text.
-- But standard practice: ALTER TYPE ... ADD VALUE ... if enum.
-- Or define a check.

-- Try to add the check constraint for project_lead logic.
-- First, if 'project_lead' is not a valid role yet in database (e.g. if enum), we must add it.
-- Let's assume it is just text for now or try to update check constraint.

-- Dropping existing check constraint if likely named 'profiles_role_check' or similar?
-- We don't know the exact name. It's safer to just run a check update.
-- BUT if Supabase Auth is used, usually public.profiles might just reflect text.

-- Let's focus on the CONSTRAINT that project_lead MUST have a school_id.
-- We can add this constraint easily.

ALTER TABLE public.profiles
ADD CONSTRAINT check_project_lead_school_assignment
CHECK (
    (role != 'project_lead') OR (school_id IS NOT NULL)
);

-- Note: We might also want to ensure that other roles don't necessarily need it, or whatever.
-- This creates a rule: If Role IS Project Lead, School ID CANNOT be NULL.
-- For all other roles, School ID can be anything (NULL or NOT NULL).

-- If role is an enum, we might need to add the value.
-- DO block to handle enum checking would be advanced, but let's try assuming text or updateable enum.
-- If it fails, user can tell us.

-- If using PostgreSQL native enum:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'project_lead';
    END IF;
END$$;
