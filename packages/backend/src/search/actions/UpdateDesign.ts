import type { DesignDataModel } from "@src/database/types/Design";
import { searchClient } from "../AISearch";
import { aiSearchIndexDocumentSchema } from "../types/AISearchIndexDocument";
import { designDataModelToSearchIndexDocument } from "../utils/DesignDataModelToSearchIndexDocument";

export async function aiSearchUpdateDesign(design: DesignDataModel) {
  const { results } = await searchClient.mergeDocuments([
    aiSearchIndexDocumentSchema.encode(
      designDataModelToSearchIndexDocument(design)
    ),
  ]);

  if (!results.every((r) => r.succeeded)) {
    throw new Error(
      `Failed to update design ${design.id} in AI Search index: ${results
        .map((r) => r.errorMessage)
        .join(", ")}`
    );
  }
}
