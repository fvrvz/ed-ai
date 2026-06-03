import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

async function generateEmbedding(text: string, hfApiKey: string): Promise<number[]> {
  try {
    const response = await fetch('https://router.huggingface.co/hf-inference/models/google/embeddinggemma-300m/pipeline/feature-extraction', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Hugging Face embedding response:', data);
    return data;
  } catch (error) {
    console.error('generate-embeddings: Hugging Face embedding failed', { error: getErrorMessage(error) });
    throw new Error(`Hugging Face embedding generation failed: ${getErrorMessage(error)}`);
  }
}

export default {
  fetch: withSupabase({ auth: ["user"] }, async (req, ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const body = await req.json();
      
      if (!isRecord(body)) {
        throw new Error('Invalid request body.');
      }

      const query = typeof body.query === 'string' ? body.query : undefined;
      const clientId = typeof body.clientId === 'string' ? body.clientId : undefined;

      if (!query || !clientId) {
        throw new Error('Missing required parameters: query and clientId must be strings.');
      }

      const adminClient = ctx.supabaseAdmin;
      
       // Fetch Hugging Face API key from system settings
      const { data: hfSettings, error: hfSettingsError } = await adminClient
        .from('system_settings')
        .select('huggingface_api_key')
        .eq('client_id', clientId)
        .single();

      if (hfSettingsError || !hfSettings?.huggingface_api_key) {
        throw new Error('Failed to retrieve Hugging Face API key for this client.');
      }

      const hfApiKey = hfSettings.huggingface_api_key;

      if (!query || !hfApiKey) {
        throw new Error('Missing required parameters: query or hfApiKey');
      }

      const embedding = await generateEmbedding(query, hfApiKey);

      return Response.json({ embedding }, { headers: corsHeaders });
    } catch (error: unknown) {
      console.error('groq-chat: unhandled error', {
        message: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return Response.json(
        { error: getErrorMessage(error) || 'Embedding generation failed' },
        { status: 400, headers: corsHeaders }
      );
    }
  }),
};

