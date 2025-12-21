-- 1. Add approval column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- 2. Auto-approve existing Admins/CEOs (so you don't lock yourself out!)
UPDATE public.profiles 
SET is_approved = true 
WHERE role IN ('admin', 'ceo');

-- 3. RLS: Allow Admins to update 'is_approved' and 'role'
-- By default, Users can only update their own profile? Or not defined?
-- Let's check existing: "Users can see own profile", "Management can view all".
-- We need a policy for UPDATE.

CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE
USING (public.get_my_role() IN ('admin', 'ceo'));

-- 4. Trigger to create profile on signup (Optional but good)
-- If we rely on manual Dashboard creation, we might not need this. 
-- But for the "/signup" page flow, we definitely need it.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'sales_executive', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger only if it doesn't exist (Drop first to be safe or conditional)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

