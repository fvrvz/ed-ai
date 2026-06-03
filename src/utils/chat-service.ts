import { SystemSettings } from '@/types/system-settings';
import Groq from 'groq-sdk';
import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

interface EmbeddingResponse {
  embedding: number[];
  error?: string;
}

interface GrokChatPayload {
  clientId: string;
  courseId: string;
  messages: ChatMessage[];
}

/**
 * Generate embeddings via edge function (OpenAI backend).
 * Lightweight, reliable, consistent embeddings.
 */
async function generateEmbeddingViaEdgeFunction(query: string, clientId: string): Promise<number[]> {
  try {
    console.log('chat-service: calling embedding edge function', { queryLength: query.length });

    const { data, error } = await supabase.functions.invoke<EmbeddingResponse>('groq-chat', {
      method: 'POST',
      body: { query, clientId },
    });

    if (error) {
      console.error('chat-service: edge function error', { error });
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (!data || !Array.isArray(data.embedding)) {
      console.error('chat-service: invalid embedding response', { data });
      throw new Error('Invalid embedding response from edge function');
    }

    return data.embedding;
  } catch (error: unknown) {
    console.error('chat-service: embedding generation failed', { error: getErrorMessage(error) });
    throw new Error(`Embedding generation failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Sends chat message to Groq AI with course context.
 * Handles RAG lookup and chat completion client-side.
 */
export const sendChatMessageToGrok = async ({
  clientId,
  courseId,
  messages
}: GrokChatPayload): Promise<string> => {
  try {
    // 1. Verify there is a live, valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Action denied: Session token is missing or expired.');
    }

    // 2. Fetch client's API keys from system settings (RLS protected)
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('groq_api_key, groq_model_name, huggingface_api_key')
      .eq('client_id', clientId)
      .single();

    if (settingsError) {
      console.error('chat-service: settings query failed', { settingsError });
      throw new Error('Failed to retrieve API keys for this client.');
    }

    if (!settings || !settings.groq_api_key || !settings.groq_model_name || !settings.huggingface_api_key) {
      console.error('chat-service: missing client settings', { settings });
      throw new Error('Failed to retrieve required API keys for this client.');
    }

    const typedSettings: SystemSettings = settings as unknown as SystemSettings;

    // 3. Generate embedding vector via edge function
    const userLatestMessage = [...messages]
      .reverse()
      .find((msg): msg is ChatMessage => msg.role === 'user')
      ?.content;

    if (!userLatestMessage) {
      throw new Error('Unable to find the latest user message in the conversation history.');
    }

    const userQueryVector = await generateEmbeddingViaEdgeFunction(userLatestMessage, clientId);

    // 4. Query the knowledge base using the embedding vector
    console.log('chat-service: matching course chunks', {
      courseId,
      vectorDimension: userQueryVector.length,
    });

    const { data: matchedChunks, error: rpcError } = await supabase
      .rpc('match_course_chunks', {
        query_embedding: userQueryVector,
        match_threshold: 0.3,
        match_count: 5,
        target_course_id: courseId
      });

    if (rpcError) throw rpcError;

    // 5. Combine matched chunks into context
    const contextText = Array.isArray(matchedChunks) && matchedChunks.length > 0
      ? matchedChunks
          .map((chunk) => {
            if (!isRecord(chunk) || typeof chunk.content !== 'string') {
              return '';
            }
            return chunk.content;
          })
          .filter(Boolean)
          .join('\n\n')
      : "No relevant documentation found in the knowledge base for this course.";

    // 6. Create the system prompt with course context
    const systemPrompt = `You are the EdAI learning assistant for this course. 
Answer the user's question using ONLY the provided course documentation context below. 

Course Documentation Context:
${contextText}

If the answer cannot be found in the context, state clearly: "I cannot find this information in the course knowledge base."`;

    // 7. Initialize Groq client (via OpenAI SDK with Groq baseURL)
    const groq = new Groq({
      apiKey: typedSettings.groq_api_key,
    });

    console.log('chat-service: sending chat request', {
      model: typedSettings.groq_model_name,
      messagesCount: messages.length + 1, // +1 for system message
    });

    // 8. Call Groq chat completion API
    const response = await groq.chat.completions.create({
      model: typedSettings.groq_model_name,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    // 9. Extract response and validate
    if (!response.choices || response.choices.length === 0) {
      console.error('chat-service: no choices in response', { response });
      throw new Error('Groq API returned no response choices.');
    }

    const firstChoice = response.choices[0];
    if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
      console.error('chat-service: invalid response message', { firstChoice });
      throw new Error('Groq API response did not contain valid text.');
    }

    return firstChoice.message.content;
  } catch (error: unknown) {
    console.error('chat-service: chat failed', { error: getErrorMessage(error) });
    throw error;
  }
};

