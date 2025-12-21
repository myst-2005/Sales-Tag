
-- Add target_school_id to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS target_school_id uuid REFERENCES public.schools(id);

-- Update RLS if necessary (usually existing policies cover new columns if they are generic 'FOR ALL')
