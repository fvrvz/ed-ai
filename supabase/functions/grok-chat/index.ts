import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

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
      // 1. Receive the courseId alongside chat messages from Expo
      const { clientId, courseId, messages } = await req.json();
      if (!clientId || !courseId || !messages) {
        throw new Error("Missing required parameters: clientId, courseId, or messages");
      }

      // Get the latest message sent by the user to use for the vector search
      const userLatestMessage = messages[messages.length - 1].content;

      // 2. Generate an embedding vector for the user's question
      // In production, invoke your embedding model here. Showing a 1536 mock array placeholder:
      const userQueryVector = Array.from({ length: 1536 }, () => Math.random());

      // 3. Invoke the RPC function we created to search only this course's knowledge base
      const { data: matchedChunks, error: rpcError } = await ctx.supabaseAdmin
        .rpc('match_course_chunks', {
          query_embedding: userQueryVector,
          match_threshold: 0.3, // Filter out low-quality matches
          match_count: 5,        // Take the top 5 most relevant pieces of text
          target_course_id: courseId
        });

      if (rpcError) throw rpcError;

      // Combine text pieces from the database matching the search query
      const contextText = matchedChunks && matchedChunks.length > 0
        ? matchedChunks.map((chunk: any) => chunk.content).join('\n\n')
        : "No relevant documentation found in the knowledge base for this course.";

      // 4. Fetch the client's custom Grok API key out of settings vault
      const { data: settings, error: settingsError } = await ctx.supabaseAdmin
        .from('system_settings')
        .select('grok_api_key, grok_model_name')
        .eq('client_id', clientId)
        .single();

      if (settingsError || !settings) {
        throw new Error('Failed to retrieve keys for this client.');
      }

      // 5. Structure the prompt to lock Grok into the context of the course documentation
      const systemPrompt = `You are the EdAI learning assistant for this course. 
Answer the user's question using ONLY the provided course documentation context below. 

Course Documentation Context:
${contextText}

If the answer cannot be found in the context, state clearly: "I cannot find this information in the course knowledge base."`;

      // 6. Request the response from Grok AI
      const response = await fetch('https://x.ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.grok_api_key}`
        },
        body: JSON.stringify({
          model: settings.grok_model_name,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.1 // Low temperature keeps the model focused on the text provided
        })
      });

      const aiData = await response.json();
      const aiReply = aiData.choices?.[0]?.message?.content || "No response generated.";

      return Response.json({ response: aiReply }, { headers: corsHeaders });

    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
  }),
};



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/grok-chat' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
