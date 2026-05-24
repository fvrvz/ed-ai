CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;


CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (public.is_admin());


CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());


CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());
