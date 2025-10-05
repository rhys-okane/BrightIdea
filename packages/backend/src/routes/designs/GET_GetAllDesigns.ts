import {designsTable} from "@src/database/schema/Designs";
import {db} from "@src/database/connection";
import type {HonoApp} from "@src/App";
import {asc} from "drizzle-orm";
import {zValidator} from "@hono/zod-validator";
import {apiGetDesignsRequestSchema} from "@shared/models/api/APIGetDesignsRequestSchema";

export function listenForGetDesignsGETRequest(app: HonoApp) {
	app.get("/designs", zValidator("query", apiGetDesignsRequestSchema), async context => {
		const queryParams = context.req.valid("query");

		const page = queryParams.page;
		const pageSize = queryParams.pageSize;
		const offset = (page - 1) * pageSize;

		const designs = await db(context.env.Database)
			.select()
			.from(designsTable)
			.orderBy(asc(designsTable.id))
			.limit(pageSize)
			.offset(offset)
			.all();

		return context.json(
			designs.map(design => ({
				...design,
				editToken: undefined,
			})),
		);
	});
}
