
-- Create user_targets table for individual sales executive targets
CREATE TABLE IF NOT EXISTS user_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_month DATE NOT NULL,
    target_revenue NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_month)
);

-- RLS
ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" ON user_targets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert/update for leadership" ON user_targets FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'head_of_sales', 'project_lead', 'sales_team_lead')
    )
);
