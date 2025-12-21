-- 1. Update the Enum to include the new role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'project_lead';

-- 2. Add a constraint to ensure Project Leads always have a school assigned
-- Note: This assumes 'profiles' table exists and has 'role' and 'school_id' columns.
ALTER TABLE public.profiles
ADD CONSTRAINT check_project_lead_school_assignment
CHECK (
    (role != 'project_lead') OR (school_id IS NOT NULL)
);
