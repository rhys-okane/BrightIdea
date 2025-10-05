import type {HonoApp} from "@src/App";
import {db} from "@src/database/connection";
import {designsTable} from "@src/database/schema/Designs";
import {getIp} from "@src/routes/designs/utils/GetIp";
import {validateTurnstileToken} from "@src/routes/designs/utils/ValidateTurnstileToken";
import {eq} from "drizzle-orm";
import {isValid as isValidUlid} from "ulid";
import {apiDeleteDesignRequestSchema} from "@shared/models/api/APIDeleteDesignRequest";
import {validateUlidParam} from "@src/middleware/ValidUlidParam";
import {validateEditTokenPresentAndSafe} from "@src/middleware/EditTokenPresentAndSafe";

export function listenForDeleteDesignDELETERequest(app: HonoApp) {
	app.delete("/designs/:id", validateUlidParam, validateEditTokenPresentAndSafe, async context => {
		const id = context.req.param("id");

		const editToken = context.req.header("Authorization");

		const body = await context.req.json();
		const parsed = apiDeleteDesignRequestSchema.safeParse(body);

		if (!parsed.success) {
			return context.json({message: "Invalid request body", errors: parsed.error}, 400);
		}

		const ip = getIp(context);
		const turnstileResult = await validateTurnstileToken(parsed.data.turnstileToken, ip);

		if (!turnstileResult.success) {
			return context.json({message: "CAPTCHA validation failed", errors: turnstileResult.errors}, 403);
		}

		const design = await db(context.env.Database).select().from(designsTable).where(eq(designsTable.id, id)).get();

		if (!design) {
			return context.json({message: "Design not found"}, 404);
		}

		if (design.editToken !== editToken) {
			return context.json({message: "Invalid edit token"}, 401);
		}

		await db(context.env.Database).delete(designsTable).where(eq(designsTable.id, id)).run();

		return context.json({message: "Design deleted successfully"});
	});
}
