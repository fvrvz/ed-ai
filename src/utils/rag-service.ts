import { supabase } from './supabase';

interface EmbeddingRequest {
  clientId: string;
  documentId: string;
  storagePath: string;
  fileType: string;
}

interface EmbeddingResponse { success: boolean, chunksProcessed: number }

/**
 * Client-side basic text segmentation tool (Sliding window token alternative)
 */
export const chunkTextContent = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    chunks.push(text.substring(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  
  return chunks;
};

/**
 * Dispatches text blocks to the vector processor table mapping workflow.
 */
export const triggerVectorProcessing = async (payload: EmbeddingRequest): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke<EmbeddingResponse>('generate-embeddings', {
      method: 'POST',
      body: payload,
    });

    if (error) throw new Error(error.message);
    return data?.success || false;
  } catch (error) {
    console.error('Vector processing hook transaction failure:', error);
    throw error;
  }
};
