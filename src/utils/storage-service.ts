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

/**
 * Deletes a file from Supabase Storage using its public URL or raw folder path.
 * @param storageUrl Or absolute file path inside the bucket (e.g. 'clientId/1715800000-manual.pdf')
 */
export const deleteDocumentFromStorage = async (storageUrl: string): Promise<void> => {
  try {
    // 1. Verify user authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Action denied: User is unauthenticated.");
    }

    // 2. Extract the relative path if a full URL is passed
    let relativePath = storageUrl;
    if (storageUrl.includes("/storage/v1/object/public/documents/")) {
      relativePath = storageUrl.split("/storage/v1/object/public/documents/")[1];
    }

    // 3. Request deletion from Supabase Storage bucket
    const { data, error } = await supabase.storage
      .from("documents")
      .remove([relativePath]);

    if (error) {
      throw new Error(error.message);
    }

    // If data array comes back empty, it means the file path didn't match anything in the bucket
    if (!data || data.length === 0) {
      throw new Error("Target file was not found in storage bucket during deletion routine.");
    }

    console.log(`Successfully removed file from storage bucket: ${relativePath}`);
  } catch (error) {
    console.error("Supabase Storage delete helper failure:", error);
    throw error;
  }
};