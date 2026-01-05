import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { API_URL } from "./constants/ApiConstants";

export async function apiUploadDesignMedia(file: File, design: PlayableDesign, auth0Token: string): Promise<string> {
  const mediaUploadResponse = await fetch(
    `${API_URL}/designs/${design.id}/media-upload-url?contentType=${encodeURIComponent(file.type)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth0Token}`,
      },
    }
  );

  if (!mediaUploadResponse.ok) {
    throw new Error("Failed to get media upload URL");
  }

  const { uploadUrl, fileName } = await mediaUploadResponse.json();

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "x-ms-version": "2023-11-03",
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload media file");
  }

  return fileName;
}
