-- 1. ADMIN POLICIES FOR DOCUMENTS TABLE

CREATE POLICY "Admins can insert documents for their tenant" 
ON public.documents FOR INSERT TO authenticated 
WITH CHECK (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
);

CREATE POLICY "Admins can update documents for their tenant" 
ON public.documents FOR UPDATE TO authenticated 
USING (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
)
WITH CHECK (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
);

CREATE POLICY "Admins can delete documents from their tenant" 
ON public.documents FOR DELETE TO authenticated 
USING (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
);


-- 2. ADMIN POLICIES FOR DOCUMENT_CHUNKS TABLE
-- (Provides frontend fallbacks if admins test raw chunk processing or overrides)

CREATE POLICY "Admins can insert chunks for their tenant" 
ON public.document_chunks FOR INSERT TO authenticated 
WITH CHECK (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
);

CREATE POLICY "Admins can update chunks for their tenant" 
ON public.document_chunks FOR UPDATE TO authenticated 
USING (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
)
WITH CHECK (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
);

CREATE POLICY "Admins can delete chunks from their tenant" 
ON public.document_chunks FOR DELETE TO authenticated 
USING (
    client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
);
