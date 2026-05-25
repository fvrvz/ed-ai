import { supabase } from "./supabase";

interface UploadAssetRequest {
  clientId: string;
  fileUri: string;
  fileName: string;
  fileType: string;
}

/**
 * Uploads a document directly to Supabase Storage.
 * @returns The public URL for the uploaded asset.
 */
export const uploadDocumentToStorage = async ({
  clientId,
  fileUri,
  fileName,
  fileType,
}: UploadAssetRequest): Promise<string> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      throw new Error("Action denied: User is unauthenticated.");
    }

    const response = await fetch(fileUri);

    if (!response.ok) {
      throw new Error("Failed to read the selected file.");
    }

    const safeFileName = fileName.replace(/[/\\]+/g, "_");
    const filePath = `${clientId}/${Date.now()}-${safeFileName}`;
    const fileContents = new Uint8Array(await response.arrayBuffer());

    const { error } = await supabase.storage.from("documents").upload(filePath, fileContents, {
      contentType: fileType,
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error("Failed to build the storage URL.");
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Supabase Storage upload helper failure:", error);
    throw error;
  }
};
