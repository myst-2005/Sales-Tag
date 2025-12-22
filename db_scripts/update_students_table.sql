ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS payment_plan text, -- 'one_time', 'emi', 'cumulative'
ADD COLUMN IF NOT EXISTS batch_id uuid, -- Link to batch table if needed later, generic for now
ADD COLUMN IF NOT EXISTS joining_date timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Add check constraint for payment plan
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_payment_plan_check;
ALTER TABLE public.students ADD CONSTRAINT students_payment_plan_check 
CHECK (payment_plan IN ('one_time', 'emi', 'cumulative'));
