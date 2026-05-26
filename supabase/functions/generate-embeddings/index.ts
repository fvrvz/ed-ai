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

export default {
  fetch: withSupabase({ auth: ["user"] }, async (req, ctx) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
      const { clientId, documentId, storagePath, fileType } = await req.json();
      
      if (!clientId || !documentId || !storagePath) {
        throw new Error('Missing required parameters: clientId, documentId, or storagePath');
      }

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

      const adminClient = ctx.supabaseAdmin;

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
        const mockVector = Array.from({ length: 1536 }, () => Math.random());

        // Use adminClient (ctx.supabaseAdmin) to bypass RLS for insertion
        const { error: insertError } = await adminClient
          .from('document_chunks')
          .insert({
            client_id: clientId,
            document_id: documentId,
            content: chunk,
            embedding: mockVector
          });

        if (insertError) throw insertError;
      }

      return Response.json({ success: true, chunksProcessed: textChunks.length }, { headers: corsHeaders });

    } catch (error: any) {
      console.error(error);
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
