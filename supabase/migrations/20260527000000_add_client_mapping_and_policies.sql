ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_client_id_idx
ON public.profiles (client_id);

DROP POLICY IF EXISTS "Super admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can read their own client" ON public.clients;
DROP POLICY IF EXISTS "Users can view their client details" ON public.clients;

CREATE POLICY "Super admins can manage all clients"
ON public.clients
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Admins can read their own client"
ON public.clients
FOR SELECT
TO authenticated
USING (
  public.is_super_admin()
  OR id = (
    SELECT client_id
    FROM public.profiles
    WHERE id = auth.uid()
  )
);
