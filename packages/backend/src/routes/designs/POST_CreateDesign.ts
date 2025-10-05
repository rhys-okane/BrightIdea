import {apiCreateDesignRequestSchema, type APICreateDesignResponse} from "@shared/models/api/APICreateDesignRequest";
import {designsTable} from "@src/database/schema/Designs";
import {db} from "@src/database/connection";
import {ulid} from "ulid";
import type {HonoApp} from "@src/App";
import {eq} from "drizzle-orm";
import {validateTurnstileToken} from "@src/routes/designs/utils/ValidateTurnstileToken";

export function listenForCreateDesignPOSTRequest(app: HonoApp) {
	app.post("/designs", async context => {
		const body = apiCreateDesignRequestSchema.safeParse(await context.req.json());

		if (!body.success) {
			return context.json({message: "Invalid request", errors: body.error}, 400);
		}
		const {name, frames, createdBy, turnstileToken} = body.data;

		const ip = context.req.header("CF-Connecting-IP") || context.req.header("X-Forwarded-For") || "unknown";

		const turnstileResult = await validateTurnstileToken(turnstileToken, ip);

		if (!turnstileResult.success) {
			return context.json({message: "CAPTCHA validation failed", errors: turnstileResult.errors}, 403);
		}

		const d1 = db(context.env.Database);

		const nameConflict = await d1.select().from(designsTable).where(eq(designsTable.name, name)).get();

		if (nameConflict) {
			return context.json({message: "A design with that name already exists."}, 409);
		}

		const newDesign: APICreateDesignResponse = await d1
			.insert(designsTable)
			.values({
				name,
				createdBy: createdBy,
				frames,
				editToken: ulid(),
			})
			.returning()
			.get();

		return context.json(newDesign);
	});
}
