import { API_URL } from "@src/lib/api/constants/ApiConstants";
import type { MyStoreDesign } from "@src/store/types/design/StoreDesign";

export class DeleteDesignError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly type:
      | "not_found"
      | "network"
      | "unknown"
      | "captcha"
      | "unauthorized"
  ) {
    super(message);
    this.name = "DeleteDesignError";
  }
}

export async function apiDeleteDesign(
  design: MyStoreDesign,
  turnstileToken: string
): Promise<void> {
  const response = await fetch(`${API_URL}/designs/${design.id}`, {
    method: "DELETE",
    headers: {
      Authorization: design.editToken,
    },
    body: JSON.stringify({ turnstileToken: turnstileToken }),
  });

  if (response.status === 401) {
    throw new DeleteDesignError(
      "Couldn't validate your ownership of this design",
      401,
      "unauthorized"
    );
  }

  if (response.status === 404) {
    throw new DeleteDesignError("Design not found", 404, "not_found");
  }

  if (response.status === 403) {
    throw new DeleteDesignError("CAPTCHA validation failed", 403, "captcha");
  }

  if (!response.ok) {
    throw new DeleteDesignError(
      "Failed to delete design",
      response.status,
      "unknown"
    );
  }

  return;
}
