import type {HonoApp} from "@src/App";
import {db} from "@src/database/connection";
import {designsTable} from "@src/database/schema/Designs";
import {eq} from "drizzle-orm";
import {isValid as isValidUlid} from "ulid";

export function listenForDeleteDesignDELETERequest(app: HonoApp) {
	app.delete("/designs/:id", async context => {
		const id = context.req.param("id");

		if (!isValidUlid(id)) {
			return context.json({message: "Invalid design ID"}, 400);
		}

		const editToken = context.req.header("Authorization");
		if (!isValidUlid(editToken || "")) {
			return context.json({message: "Missing or invalid edit token"}, 401);
		}

		const design = await db(context.env.Database).select().from(designsTable).where(eq(designsTable.id, id)).get();

		if (!design) {
			return context.json({message: "Design not found"}, 404);
		}

		if (design.editToken !== editToken) {
			return context.json({message: "Invalid edit token"}, 403);
		}

		await db(context.env.Database).delete(designsTable).where(eq(designsTable.id, id)).run();

		return context.json({message: "Design deleted successfully"});
	});
}
