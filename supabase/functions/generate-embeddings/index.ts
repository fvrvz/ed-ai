import { withSupabase } from "@supabase/server";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Clean alias import linked directly through deno.json
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default {
  fetch: withSupabase({ auth: ["user"] }, async (req, ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { clientId, documentId, textChunks } = await req.json();
      if (!clientId || !documentId || !textChunks) {
        throw new Error('Missing parameter matrix.');
      }

      const { data: settings, error: settingsError } = await ctx.supabaseAdmin
        .from('system_settings')
        .select('supabase_service_role_key')
        .eq('client_id', clientId)
        .single();

      if (settingsError || !settings || !settings.supabase_service_role_key) {
        throw new Error('Failed to retrieve isolated client database keys.');
      }

      const clientDbInstance = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        settings.supabase_service_role_key
      );

      for (const chunk of textChunks) {
        const mockVector = Array.from({ length: 1536 }, () => Math.random());

        const { error: insertError } = await clientDbInstance
          .from('document_chunks')
          .insert({
            client_id: clientId,
            document_id: documentId,
            content: chunk,
            embedding: mockVector
          });

        if (insertError) throw insertError;
      }

      return Response.json({ success: true, message: 'Vectors processed successfully.' }, { headers: corsHeaders });

    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
  }),
};



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-embeddings' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
