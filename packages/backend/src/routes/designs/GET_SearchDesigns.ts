import type { HonoApp } from "@src/App";
import { zValidator } from "@hono/zod-validator";
import { getPaginatedDesignsQuery } from "@src/database/queries/GetPaginatedDesigns";
import { type APIGetDesignsResponse } from "@shared/models/api/APIGetDesignsRequest";
import {
  apiSearchDesignsRequestSchema,
  type APISearchDesignsResponse,
} from "@shared/models/api/APISearchDesignsRequestSchema";
import { aiSearchSearchDesigns } from "@src/search/actions/SearchDesigns";
import { designSearchIndexDocumentToSearchResponse } from "@src/search/utils/DesignSearchModelToSearchResponse";

export function listenForGetSearchDesignsGETRequest(app: HonoApp) {
  app.get("/api/designs/search", zValidator("query", apiSearchDesignsRequestSchema), async (context) => {
    const queryParams = context.req.valid("query");

    const { items, totalCount } = await aiSearchSearchDesigns(
      queryParams.query,
      queryParams.page,
      queryParams.pageSize
    );

    const response: APISearchDesignsResponse = {
      designs: items.map((item) => designSearchIndexDocumentToSearchResponse(item)),
      totalCount,
    };

    return context.json(response);
  });
}
