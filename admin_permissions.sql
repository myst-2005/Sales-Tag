-- RUN THIS TO ENABLE ADMIN WRITE ACCESS

-- 1. Students Insert/Update
DROP POLICY IF EXISTS "Data Entry insert students" ON public.students;
CREATE POLICY "Staff insert students" ON public.students FOR INSERT
WITH CHECK (public.get_my_role() IN ('data_entry', 'admin'));

-- 2. Payments Insert
DROP POLICY IF EXISTS "Data Entry insert payments" ON public.payments;
CREATE POLICY "Staff insert payments" ON public.payments FOR INSERT
WITH CHECK (public.get_my_role() IN ('data_entry', 'admin'));

-- 3. Campaigns Insert (If not already public/checked)
-- Campaigns generally restricted? Schema didn't define strict RLS for campaigns yet (default deny? or expected separate policy?)
-- Schema said: "alter table public.campaigns ..." but didn't add policies in the original file?
-- Let's check schema.sql... It actually didn't enable RLS on campaigns in the file I wrote!
-- It said: `alter table public.schools enable...` `courses` `profiles` `students` `payments`. 
-- `campaigns` and `campaign_leads` were missed in the RLS block of schema.sql! 
-- I should fix that too.

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage Campaigns" ON public.campaigns FOR ALL
USING (public.get_my_role() IN ('ceo', 'head_of_sales', 'admin', 'data_entry'));

CREATE POLICY "Manage Leads" ON public.campaign_leads FOR ALL
USING (public.get_my_role() IN ('ceo', 'head_of_sales', 'admin', 'data_entry'));
