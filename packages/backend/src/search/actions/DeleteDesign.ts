import type { DesignDataModel } from "@src/database/types/Design";
import { searchClient } from "../AISearch";
import { aiSearchIndexDocumentSchema } from "../types/AISearchIndexDocument";
import { designDataModelToSearchIndexDocument } from "../utils/DesignDataModelToSearchIndexDocument";

export async function aiSearchDeleteDesign(design: DesignDataModel) {
  const { results } = await searchClient.deleteDocuments([
    aiSearchIndexDocumentSchema.encode(
      designDataModelToSearchIndexDocument(design)
    ),
  ]);

  if (!results.every((r) => r.succeeded)) {
    throw new Error(
      `Failed to delete design ${design.id} from AI Search index: ${results
        .map((r) => r.errorMessage)
        .join(", ")}`
    );
  }
}
