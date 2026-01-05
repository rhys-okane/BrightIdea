import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { API_URL } from "./constants/ApiConstants";

export async function apiDeleteDesignMediaFile(
  design: PlayableDesign,
  fileName: string,
  auth0Token: string
): Promise<void> {
  const mediaUploadResponse = await fetch(`${API_URL}/designs/${design.id}/${fileName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${auth0Token}`,
    },
  });

  if (!mediaUploadResponse.ok) {
    throw new Error("Failed to delete media file");
  }
}
