import {apiCreateDesignRequestSchema, type APICreateDesignResponse} from "@shared/models/api/APICreateDesignRequest";
import {designsTable} from "@src/database/schema/Designs";
import {db} from "@src/database/connection";
import {ulid} from "ulid";
import type {HonoApp} from "@src/App";
import {eq} from "drizzle-orm";
import {validateTurnstileToken} from "@src/routes/designs/utils/ValidateTurnstileToken";
import {getIp} from "@src/routes/designs/utils/GetIp";
import {zValidator} from "@hono/zod-validator";

export function listenForCreateDesignPOSTRequest(app: HonoApp) {
	app.post("/designs", zValidator("json", apiCreateDesignRequestSchema), async context => {
		const {name, frames, createdBy, turnstileToken} = context.req.valid("json");

		const ip = getIp(context);
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
