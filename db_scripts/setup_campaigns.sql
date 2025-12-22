
-- Create Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    target_course_id uuid REFERENCES public.courses(id),
    start_date date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create Campaign Leads Table
CREATE TABLE IF NOT EXISTS public.campaign_leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
    phone text NOT NULL,
    is_converted boolean DEFAULT false,
    converted_student_id uuid REFERENCES public.students(id),
    raw_data jsonb, -- To store extra CSV columns if any
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now - Authenticated users have access)
CREATE POLICY "Enable all for auth users campaigns" ON public.campaigns
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for auth users leads" ON public.campaign_leads
    FOR ALL USING (auth.role() = 'authenticated');
