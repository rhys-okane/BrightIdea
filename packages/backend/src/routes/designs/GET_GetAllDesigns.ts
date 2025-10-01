import {designsTable} from "@src/database/schema/Designs";
import {db} from "@src/database/connection";
import type {HonoApp} from "@src/App";
import {asc} from "drizzle-orm";

export function listenForGetDesignsGETRequest(app: HonoApp) {
	app.get("/designs", async context => {
		const queryParams = context.req.query();

		const page = queryParams.page ? Number(queryParams.page) : 1;
		const pageSize = queryParams.pageSize ? Number(queryParams.pageSize) : 20;

		if (isNaN(page) || page < 1) {
			return context.json({message: "Invalid page parameter"}, 400);
		}

		if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
			return context.json({message: "Invalid pageSize parameter"}, 400);
		}

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
