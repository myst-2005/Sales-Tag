-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- CAMPAIGNS POLICIES
DROP POLICY IF EXISTS "Campaigns viewable by authenticated" ON public.campaigns;
DROP POLICY IF EXISTS "Management manage campaigns" ON public.campaigns;

CREATE POLICY "Campaigns viewable by authenticated" ON public.campaigns 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Management manage campaigns" ON public.campaigns 
FOR ALL USING (
  public.get_my_role() IN ('admin', 'head_of_sales', 'ceo', 'cfo', 'project_lead', 'sales_team_lead', 'data_entry')
);

-- CAMPAIGN LEADS POLICIES
DROP POLICY IF EXISTS "Campaign leads viewable by authenticated" ON public.campaign_leads;
DROP POLICY IF EXISTS "Management manage campaign leads" ON public.campaign_leads;

CREATE POLICY "Campaign leads viewable by authenticated" ON public.campaign_leads 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Management manage campaign leads" ON public.campaign_leads 
FOR ALL USING (
  public.get_my_role() IN ('admin', 'head_of_sales', 'ceo', 'cfo', 'project_lead', 'sales_team_lead', 'data_entry')
);
