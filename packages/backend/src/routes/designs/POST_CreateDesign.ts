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
import {createDesignQuery} from "@src/database/queries/CreateDesign";
import {sendDesignCreateNotificationEmail} from "@src/email/emails/SendDesignCreateNotificationEmail";
import {aiSearchIndexDesign} from "@src/search/actions/IndexDesign";

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

			const newDesign: DesignDataModel = {
				id: ulid(),
				name,
				frames,
				editToken: ulid(),
				createdBy: createdBy,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await createDesignQuery(newDesign);
			await aiSearchIndexDesign(newDesign);
			await sendDesignCreateNotificationEmail(newDesign, context.env.azureContext).catch(error => {
				context.env.azureContext.warn("Failed to send design creation notification email", error);
			});

			return context.json<APICreateDesignResponse>(
				{
					id: newDesign.id,
					name: newDesign.name,
					editToken: newDesign.editToken,
					frames: newDesign.frames,
					createdBy: newDesign.createdBy,
					createdAt: newDesign.createdAt,
				},
				201,
			);
		},
	);
}
