import type {HonoApp} from "@src/App";
import {zValidator} from "@hono/zod-validator";
import {apiGetDesignsRequestSchema} from "@shared/models/api/APIGetDesignsRequestSchema";
import {getPaginatedDesignsQuery} from "@src/database/queries/GetPaginatedDesigns";

export function listenForGetDesignsGETRequest(app: HonoApp) {
	app.get("/designs", zValidator("query", apiGetDesignsRequestSchema), async context => {
		const queryParams = context.req.valid("query");

		const lastSeen = queryParams.lastSeen;
		const pageSize = queryParams.pageSize;

		const designs = await getPaginatedDesignsQuery(pageSize, lastSeen);

		return context.json(designs);
	});
}
