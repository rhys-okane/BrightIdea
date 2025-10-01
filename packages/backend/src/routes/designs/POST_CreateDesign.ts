import type {Hono} from "hono";
import {apiCreateDesignRequestSchema} from "@shared/models/api/APICreateDesignRequest";
import {designsTable} from "@src/database/schema/Designs";
import {db} from "@src/database/connection";
import {ulid} from "ulid";

// TODO: CAPTCHA

export function listenForCreateDesignPOSTRequest(app: Hono) {
	app.post("/designs", async context => {
		const body = apiCreateDesignRequestSchema.safeParse(await context.req.json());

		if (!body.success) {
			return context.json({message: "Invalid request", errors: body.error}, 400);
		}
		const {name, design, createdBy} = body.data;

		const newDesign = await db
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
