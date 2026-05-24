import { supabase } from './supabase';

interface UploadAssetRequest {
  clientId: string;
  fileUri: string;      // From expo-document-picker (e.g., "file://...")
  fileName: string;     // e.g., "manual.pdf"
  fileType: string;     // e.g., "application/pdf"
}

/**
 * Uploads a document via Multipart Form Data to the r2-upload Edge Function.
 * @returns The destination URL string hosted on Cloudflare R2.
 */
export const uploadDocumentToR2 = async ({
  clientId,
  fileUri,
  fileName,
  fileType
}: UploadAssetRequest): Promise<string> => {
  try {
    // 1. Pack the asset elements into a web-compliant form payload
    const formData = new FormData();
    formData.append('clientId', clientId);
    
    // React Native requires this explicit structural map shape to handle multi-part streams
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    // 2. Fetch the logged-in user session token to validate request parameters 
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Action denied: User is unauthenticated.');

    const edgeFunctionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/r2-upload`;

    // 3. Dispatch the payload using native fetch
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Server error encountered during stream orchestration.');
    }

    return result.url; // Returns public asset URL path string
  } catch (error: any) {
    console.error('R2 upload helper transaction failure:', error);
    throw error;
  }
};
