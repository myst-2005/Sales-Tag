-- Enable RLS (idempotent)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to View students
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.students;
CREATE POLICY "Enable read access for authenticated users" ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to Insert students
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.students;
CREATE POLICY "Enable insert access for authenticated users" ON public.students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to Update students
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.students;
CREATE POLICY "Enable update access for authenticated users" ON public.students
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow all authenticated users to Delete students
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.students;
CREATE POLICY "Enable delete access for authenticated users" ON public.students
  FOR DELETE USING (auth.role() = 'authenticated');
