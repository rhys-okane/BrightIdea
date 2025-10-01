import {apiCreateDesignRequestSchema} from "@shared/models/api/APICreateDesignRequest";
import {designsTable} from "@src/database/schema/Designs";
import {db} from "@src/database/connection";
import {ulid} from "ulid";
import type {HonoApp} from "@src/App";
import {eq} from "drizzle-orm";

// TODO: CAPTCHA

export function listenForCreateDesignPOSTRequest(app: HonoApp) {
	app.post("/designs", async context => {
		const body = apiCreateDesignRequestSchema.safeParse(await context.req.json());

		if (!body.success) {
			return context.json({message: "Invalid request", errors: body.error}, 400);
		}
		const {name, design, createdBy} = body.data;

		const d1 = db(context.env.Database);

		const nameConflict = await d1.select().from(designsTable).where(eq(designsTable.name, name)).get();

		if (nameConflict) {
			return context.json({message: "A design with that name already exists."}, 409);
		}

		const newDesign = await d1
			.insert(designsTable)
			.values({
				name,
				createdBy: createdBy,
				design,
				editToken: ulid(),
			})
			.returning()
			.get();

		return context.json(newDesign);
	});
}
