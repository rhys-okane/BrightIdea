import type {HonoApp} from "@src/App";
import {designsTable} from "@src/database/schema/Designs";
import {eq} from "drizzle-orm";
import {apiUpdateDesignRequestSchema} from "@shared/models/api/APIUpdateDesignRequestSchema";
import {validateDesignOwnership} from "@src/middleware/ValidateDesignOwnership";
import {zValidator} from "@hono/zod-validator";
import {validateTurnstileTokenFromJsonBody} from "@src/middleware/ValidateTurnstileToken";
import {updateDesignQuery} from "@src/database/queries/UpdateDesign";
import type {DesignDataModel} from "@src/database/types/Design";

export function listenForUpdateDesignPUTRequest(app: HonoApp) {
	app.put(
		"/designs/:id",
		validateTurnstileTokenFromJsonBody,
		validateDesignOwnership,
		zValidator("json", apiUpdateDesignRequestSchema),
		async context => {
			const body = context.req.valid("json");

			const updatedDesign: DesignDataModel = {
				...context.var.design,
				name: body.name,
				frames: body.frames,
				updatedAt: new Date(),
				createdBy: body.createdBy,
			};

			await updateDesignQuery(updatedDesign);

			return context.json(updatedDesign);
		},
	);
}
