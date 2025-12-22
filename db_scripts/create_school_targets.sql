
-- Create school_targets table
CREATE TABLE IF NOT EXISTS public.school_targets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
    target_month date NOT NULL, -- Stored as first day of the month e.g., 2023-12-01
    target_revenue numeric DEFAULT 0,
    target_students integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(school_id, target_month)
);

-- RLS
ALTER TABLE public.school_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.school_targets FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert/update for Head of Sales and Admin" 
ON public.school_targets FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'head_of_sales' OR profiles.role = 'admin' OR profiles.role = 'ceo')
    )
);
