
-- 1. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    amount numeric NOT NULL DEFAULT 0,
    payment_type text CHECK (payment_type IN ('one_time', 'emi', 'cumulative')),
    payment_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    remarks text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Verify 'total_fee' column exists in 'students' (It might be missing if we only added payment_plan earlier)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS total_fee numeric DEFAULT 0;

-- 3. Enable RLS on Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Add Policies for Payments
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.payments;
CREATE POLICY "Enable read access for authenticated users" ON public.payments
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.payments;
CREATE POLICY "Enable insert access for authenticated users" ON public.payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.payments;
CREATE POLICY "Enable update access for authenticated users" ON public.payments
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.payments;
CREATE POLICY "Enable delete access for authenticated users" ON public.payments
  FOR DELETE USING (auth.role() = 'authenticated');
