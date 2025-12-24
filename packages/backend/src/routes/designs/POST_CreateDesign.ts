import {
	apiCreateDesignRequestSchema,
	apiCreateDesignResponseSchema,
	type APICreateDesignResponse,
} from "@shared/models/api/APICreateDesignRequest";
import {designsTable} from "@src/database/schema/Designs";
import {ulid} from "ulid";
import type {HonoApp} from "@src/App";
import {eq} from "drizzle-orm";
import {zValidator} from "@hono/zod-validator";
import {validateTurnstileTokenFromJsonBody} from "@src/middleware/ValidateTurnstileToken";
import {getDesignByNameQuery} from "@src/database/queries/GetDesignByName";
import type {DesignDataModel} from "@src/database/types/Design";

export function listenForCreateDesignPOSTRequest(app: HonoApp) {
	app.post(
		"/designs",
		validateTurnstileTokenFromJsonBody,
		zValidator("json", apiCreateDesignRequestSchema),
		async context => {
			const {name, frames, createdBy} = context.req.valid("json");

			const nameConflict = await getDesignByNameQuery(name);

			if (nameConflict) {
				return context.json({message: "A design with that name already exists."}, 409);
			}

			// const newDesign: APICreateDesignResponse = await d1
			// 	.insert(designsTable)
			// 	.values({
			// 		name,
			// 		createdBy: createdBy,
			// 		frames,
			// 		editToken: ulid(),
			// 	})
			// 	.returning()
			// 	.get();

			const newDesign: DesignDataModel = {
				designId: ulid(),
				name,
				frames,
				createdBy: createdBy,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			return context.json<APICreateDesignResponse>(
				{
					id: newDesign.designId,
					name: newDesign.name,
					// TODO: Remove me/replace with actual login system
					editToken: ulid(),
					frames: newDesign.frames,
					createdBy: newDesign.createdBy,
					createdAt: newDesign.createdAt,
				},
				201,
			);
		},
	);
}
