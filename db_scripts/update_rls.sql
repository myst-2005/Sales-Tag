-- Update the "Management view all profiles" policy to include 'data_entry' and 'sales_team_lead'
-- This allows Data Entry specialists to see the users they have added in the Team list.

DROP POLICY IF EXISTS "Management view all profiles" ON public.profiles;

CREATE POLICY "Management view all profiles" ON public.profiles 
FOR SELECT 
USING (
  public.get_my_role() IN (
    'ceo', 
    'cfo', 
    'admin', 
    'head_of_sales', 
    'project_lead', 
    'sales_team_lead', 
    'data_entry'
  )
);
