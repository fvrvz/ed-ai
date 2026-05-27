-- 1️⃣ Drop the old block policy to clear the table restriction
DROP POLICY IF EXISTS "Block all direct client access to secrets" ON public.system_settings;

-- 2️⃣ Ensure no legacy naming collisions exist for system_settings before applying the new ones
DROP POLICY IF EXISTS "Super Admins and Admins can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only Super Admins can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Super Admins and Tenant Admins can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only Super Admins can delete settings" ON public.system_settings;


-- 3️⃣ CREATE THE NEW ROLE-BASED POLICIES USING YOUR FUNCTIONS

-- POLICY A: View Access (SELECT)
-- Allowed for any super_admin, or a standard admin if the row matches their tenant client_id
CREATE POLICY "Super Admins and Admins can view settings" 
ON public.system_settings 
FOR SELECT 
TO authenticated 
USING (
  public.is_super_admin()
  OR (
    public.is_admin() 
    AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- POLICY B: Creation Access (INSERT)
-- Locked down strictly to the super_admin role
CREATE POLICY "Only Super Admins can insert settings" 
ON public.system_settings 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_super_admin());

-- POLICY C: Modification Access (UPDATE)
-- Allowed for any super_admin, or standard admins modifying their own company's credentials
CREATE POLICY "Super Admins and Tenant Admins can update settings" 
ON public.system_settings 
FOR UPDATE 
TO authenticated 
USING (
  public.is_super_admin()
  OR (
    public.is_admin() 
    AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  )
)
WITH CHECK (
  public.is_super_admin()
  OR (
    public.is_admin() 
    AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- POLICY D: Destruction Access (DELETE)
-- Locked down strictly to the super_admin role
CREATE POLICY "Only Super Admins can delete settings" 
ON public.system_settings 
FOR DELETE 
TO authenticated 
USING (public.is_super_admin());
