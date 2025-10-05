import type {HonoApp} from "@src/App";
import {db} from "@src/database/connection";
import {designsTable} from "@src/database/schema/Designs";
import {eq} from "drizzle-orm";
import {apiUpdateDesignRequestSchema} from "@shared/models/api/APIUpdateDesignRequestSchema";
import {validateTurnstileToken} from "@src/routes/designs/utils/ValidateTurnstileToken";
import {getIp} from "@src/routes/designs/utils/GetIp";
import {validateUlidParam} from "@src/middleware/ValidUlidParam";
import {validateEditTokenPresentAndSafe} from "@src/middleware/EditTokenPresentAndSafe";
import {zValidator} from "@hono/zod-validator";

export function listenForCreateDesignPOSTRequest(app: HonoApp) {
	app.put(
		"/designs/:id",
		validateUlidParam,
		validateEditTokenPresentAndSafe,
		zValidator("json", apiUpdateDesignRequestSchema),
		async context => {
			const id = context.req.param("id");
			const editToken = context.var.editToken;

			const body = await context.req.json();
			const parsed = apiUpdateDesignRequestSchema.safeParse(body);
			if (!parsed.success) {
				return context.json({message: "Invalid request body", errors: parsed.error}, 400);
			}

			const ip = getIp(context);
			const turnstileResult = await validateTurnstileToken(parsed.data.turnstileToken, ip);

			if (!turnstileResult.success) {
				return context.json({message: "CAPTCHA validation failed", errors: turnstileResult.errors}, 403);
			}

			const design = await db(context.env.Database)
				.select()
				.from(designsTable)
				.where(eq(designsTable.id, id))
				.get();

			if (!design) {
				return context.json({message: "Design not found"}, 404);
			}

			if (design.editToken !== editToken) {
				return context.json({message: "Invalid edit token"}, 401);
			}

			await db(context.env.Database)
				.update(designsTable)
				.set({
					name: parsed.data.name,
					frames: parsed.data.frames,
					updatedAt: new Date(),
					createdBy: parsed.data.createdBy,
				})
				.where(eq(designsTable.id, id))
				.run();

			return context.json({message: `Update design with ID ${id}`});
		},
	);
}
