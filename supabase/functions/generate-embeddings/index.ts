import { withSupabase } from "@supabase/server";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Parsers
import mammoth from "mammoth";
import pdf from "pdf-parse";
import * as XLSX from "xlsx";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

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
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const adminClient = ctx.supabaseAdmin;
    let targetDocumentId: string | null = null;

    try {
      const { clientId, documentId, storagePath, fileType } = await req.json();
      
      if (!clientId || !documentId || !storagePath) {
        throw new Error('Missing required parameters: clientId, documentId, or storagePath');
      }


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

      // Store documentId globally within scope for fallback error processing
      targetDocumentId = documentId;

      // 1️⃣ Initialize State: Explicitly set status to processing
      await adminClient
        .from('documents')
        .update({ embedding_status: 'processing' })
        .eq('id', targetDocumentId);

      // --------------------------------------------------------------------------
      // FIX: Universal Robust Path Extraction
      // --------------------------------------------------------------------------
      let storageUrl = "";
      try {
        const parsedUrl = new URL(storagePath);
        const pathSegments = parsedUrl.pathname.split('/documents/');
        
        if (pathSegments.length < 2) {
          throw new Error("Could not locate '/documents/' bucket keyword in the URI structure.");
        }
        
        // Grab everything after the bucket name container segment
        storageUrl = decodeURIComponent(pathSegments[1]);
      } catch (urlError) {
        // Fallback: If it's already a relative path rather than a URL
        storageUrl = decodeURIComponent(storagePath);
      }

      // Download & Parse (Using the Admin Client)
      console.log(`Downloading: ${storageUrl}`);
      const { data: fileBlob, error: downloadError } = await adminClient
        .storage
        .from('documents')
        .download(storageUrl);

      if (downloadError || !fileBlob) throw new Error(`Download failed: ${downloadError?.message}`);

      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer); 
      let extractedText = "";

      // ... [Parsing Logic is Identical] ...
      switch (true) {
        case fileType.includes('pdf'):
          const pdfData = await pdf(Buffer.from(buffer));
          extractedText = pdfData.text;
          break;
        case fileType.includes('word') || fileType.includes('docx'):
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          extractedText = result.value;
          break;
        case fileType.includes('sheet') || fileType.includes('excel'):
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          extractedText = XLSX.utils.sheet_to_txt(worksheet);
          break;
        default: // Text/MD
          extractedText = new TextDecoder().decode(buffer);
          break;
      }

      if (!extractedText || extractedText.length < 10) {
        throw new Error("File appears empty or text could not be extracted.");
      }

      // ✂️ Chunk & Embed
      const textChunks: string[] = [];
      const chunkSize = 1000;
      const overlap = 200;
      const saneText = cleanText(extractedText);

      let i = 0;
      while (i < saneText.length) {
        textChunks.push(saneText.substring(i, i + chunkSize));
        i += (chunkSize - overlap);
      }

      for (const chunk of textChunks) {
        const embedding = await generateEmbedding(chunk, hfApiKey);

        // Use adminClient (ctx.supabaseAdmin) to bypass RLS for insertion
        const { error: insertError } = await adminClient
          .from('document_chunks')
          .insert({
            client_id: clientId,
            document_id: targetDocumentId,
            content: chunk,
            embedding: embedding
          });

        if (insertError) throw insertError;
      }

      // 2️⃣ SUCCESS STATE: Update table row tracker to completed
      await adminClient
        .from('documents')
        .update({ 
          embedding_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', targetDocumentId);

      return Response.json({ success: true, chunksProcessed: textChunks.length }, { headers: corsHeaders });

    } catch (error: any) {
      console.error("🚨 Embeddings processing failure caught:", error.message);

      // 3️⃣ FAILURE STATE: If we have a valid document ID, flag row as failed to clean the UI
      if (targetDocumentId) {
        try {
          await adminClient
            .from('documents')
            .update({ 
              embedding_status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', targetDocumentId);
          console.log(`Document status flagged as failed for ID: ${targetDocumentId}`);
        } catch (dbStatusError: any) {
          console.error("Failed to write failed error matrix status to database:", dbStatusError.message);
        }
      }

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
