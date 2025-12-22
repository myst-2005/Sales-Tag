-- Enable RLS on profiles if not already enabled (good practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing read policy to avoid conflicts (optional, but safe)
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a policy that allows any logged-in user to view all profiles
-- This is necessary for Project Leads to see their Team Members (Sales Execs)
CREATE POLICY "Allow read access for all authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure Students are visible too
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;

CREATE POLICY "Enable read access for all users" 
ON public.students 
FOR SELECT 
TO authenticated 
USING (true);
