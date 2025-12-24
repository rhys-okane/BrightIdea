// import type {HonoApp} from "@src/App";
// import {db} from "@src/database/connection";
// import {designsTable} from "@src/database/schema/Designs";
// import {eq} from "drizzle-orm";
// import {validateDesignOwnership} from "@src/middleware/ValidateDesignOwnership";
// import {validateTurnstileTokenFromJsonBody} from "@src/middleware/ValidateTurnstileToken";

// export function listenForDeleteDesignDELETERequest(app: HonoApp) {
// 	app.delete("/designs/:id", validateTurnstileTokenFromJsonBody, validateDesignOwnership, async context => {
// 		const designId = context.var.design.id;
// 		await db(context.env.Database).delete(designsTable).where(eq(designsTable.id, designId)).run();

// 		return context.json({message: "Design deleted successfully"});
// 	});
// }
