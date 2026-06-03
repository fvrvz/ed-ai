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
  profileId: string;      // Added: Needed to link historical threads
  sessionId?: string;     // Added: Pass an existing ID, or leave blank to auto-create a session
  messages: ChatMessage[];
}

interface ChatServiceResponse {
  sessionId: string;      // Returns the session ID back to the UI so it can be re-used
  assistantMessage: string;
}

/**
 * Generate embeddings via edge function (Google Gemma 768-dim backend).
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
 * Sends chat message to Groq AI with course context and persistently updates history.
 */
export const sendChatMessageToGrok = async ({
  clientId,
  courseId,
  profileId,
  sessionId,
  messages
}: GrokChatPayload): Promise<ChatServiceResponse> => {
  try {
    // 1. Verify session token validity
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Action denied: Session token is missing or expired.');
    }

    // 2. Fetch client settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('groq_api_key, groq_model_name, huggingface_api_key')
      .eq('client_id', clientId)
      .single();

    if (settingsError || !settings?.groq_api_key || !settings?.groq_model_name) {
      throw new Error('Failed to retrieve required API keys for this client.');
    }

    const typedSettings: SystemSettings = settings as unknown as SystemSettings;

    // 3. Find latest user prompt text
    const userLatestMessage = [...messages]
      .reverse()
      .find((msg): msg is ChatMessage => msg.role === 'user')
      ?.content;

    if (!userLatestMessage) {
      throw new Error('Unable to find the latest user message in the conversation history.');
    }

    // 4. Generate 768-dim Embedding Vector
    const userQueryVector = await generateEmbeddingViaEdgeFunction(userLatestMessage, clientId);

    // 5. Query pgvector Knowledge Base Table
    const { data: matchedChunks, error: rpcError } = await supabase
      .rpc('match_course_chunks', {
        query_embedding: userQueryVector,
        match_threshold: 0.3,
        match_count: 5,
        target_course_id: courseId
      });

    if (rpcError) throw rpcError;

    // 6. Combine matched chunks
    const contextText = Array.isArray(matchedChunks) && matchedChunks.length > 0
      ? matchedChunks
          .map((chunk) => (isRecord(chunk) && typeof chunk.content === 'string' ? chunk.content : ''))
          .filter(Boolean)
          .join('\n\n')
      : "No relevant documentation found in the knowledge base for this course.";

    const systemPrompt = `You are the EdAI learning assistant for this course. 
Answer the user's question using ONLY the provided course documentation context below. 

Course Documentation Context:
${contextText}

If the answer cannot be found in the context, state clearly: "I cannot find this information in the course knowledge base."`;

    // 7. Initialize and trigger Groq API Call
    const groq = new Groq({ apiKey: typedSettings.groq_api_key });
    const response = await groq.chat.completions.create({
      model: typedSettings.groq_model_name,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.1,
      max_tokens: 1024,
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Groq API returned an empty response text or structure.');
    }

    const assistantAnswer = response.choices[0].message.content;

    // ==========================================
    // TRANSACTIONAL DATABASE SAVE OPERATIONS
    // ==========================================
    let currentSessionId = sessionId;

    // Step A: If no thread exists yet, initialize a new chat session entry
    if (!currentSessionId) {
      // Use a truncated version of the user prompt as the preview title for the history list
      const sessionTitle = userLatestMessage.length > 40 
        ? `${userLatestMessage.substring(0, 40)}...` 
        : userLatestMessage;

      const { data: newSession, error: sessionInsertError } = await supabase
        .from('chat_sessions')
        .insert({
          profile_id: profileId,
          course_id: courseId,
          title: sessionTitle
        })
        .select('id')
        .single();

      if (sessionInsertError || !newSession) {
        console.error('Database transactional rollback fallback: Failed to create thread record.', sessionInsertError);
        throw new Error(`Failed to initialize chat log record: ${sessionInsertError?.message}`);
      }

      currentSessionId = newSession.id;
    }

    // Step B: Bulk insert both conversation records back-to-back to populate data safely
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .insert([
        { session_id: currentSessionId, sender_type: 'user', content: userLatestMessage },
        { session_id: currentSessionId, sender_type: 'assistant', content: assistantAnswer }
      ]);

    if (messagesError) {
      console.error('Database isolation rollback trace: Message logging failure', messagesError);
      // NOTE: If message log breaks, you can optionally clean up/delete the session manually here,
      // but 'ON DELETE CASCADE' protections ensure table updates stay stable.
      throw new Error(`Failed to save message entries to chat logs: ${messagesError.message}`);
    }

    return {
      sessionId: currentSessionId!,
      assistantMessage: assistantAnswer
    };

  } catch (error: unknown) {
    console.error('chat-service: execution routine exception', { error: getErrorMessage(error) });
    throw error;
  }
};
