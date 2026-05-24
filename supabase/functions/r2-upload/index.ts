import { withSupabase } from "@supabase/server";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Clean alias import linked directly through deno.json
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
      const formData = await req.formData();
      const clientId = formData.get('clientId') as string;
      const file = formData.get('file') as File;
      
      if (!clientId || !file) throw new Error('Missing file or clientId parameters.');

      const { data: settings, error: settingsError } = await ctx.supabaseAdmin
        .from('system_settings')
        .select('r2_account_id, r2_access_key_id, r2_secret_access_key, r2_bucket_name')
        .eq('client_id', clientId)
        .single();

      if (settingsError || !settings) throw new Error('Failed to retrieve storage keys.');

      const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${settings.r2_account_id}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: settings.r2_access_key_id,
          secretAccessKey: settings.r2_secret_access_key,
        },
      });

      const fileBuffer = await file.arrayBuffer();
      const fileKey = `courses/${clientId}/${Date.now()}-${file.name}`;

      await r2Client.send(new PutObjectCommand({
        Bucket: settings.r2_bucket_name,
        Key: fileKey,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
      }));

      const fileUrl = `https://${settings.r2_bucket_name}://{fileKey}`;
      return Response.json({ success: true, url: fileUrl }, { headers: corsHeaders });

    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
  }),
};




/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/r2-upload' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
