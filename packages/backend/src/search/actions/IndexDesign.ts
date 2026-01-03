import type { DesignDataModel } from "@src/database/types/Design";
import { searchClient } from "../AISearch";
import { aiSearchIndexDocumentSchema } from "../types/AISearchIndexDocument";
import { designDataModelToSearchIndexDocument } from "../utils/DesignDataModelToSearchIndexDocument";

export async function aiSearchIndexDesign(design: DesignDataModel) {
  console.log(design);
  console.log(designDataModelToSearchIndexDocument(design));
  const { results } = await searchClient.uploadDocuments([
    aiSearchIndexDocumentSchema.encode(
      designDataModelToSearchIndexDocument(design)
    ),
  ]);

  if (!results.every((r) => r.succeeded)) {
    throw new Error(
      `Failed to index design ${design.id} in AI Search index: ${results
        .map((r) => r.errorMessage)
        .join(", ")}`
    );
  }
}
