import {apiCreateDesignRequestSchema} from "@shared/models/api/APICreateDesignRequest";
import type {HonoApp} from "@src/App";

export function listenForCreateDesignPOSTRequest(app: HonoApp) {
	app.put("/designs/:id", async context => {
		const id = context.req.param("id");

		const json = context.req.json();

		const parsed = apiCreateDesignRequestSchema.safeParse(await json);

		return context.json({message: `Update design with ID ${id}`});
	});
}
