import type {D1Database} from "@cloudflare/workers-types";
import {listenForDeleteDesignDELETERequest} from "@src/routes/designs/:id/DELETE_DeleteDesign";
import {listenForGetDesignsGETRequest} from "@src/routes/designs/GET_GetAllDesigns";
import {listenForCreateDesignPOSTRequest} from "@src/routes/designs/POST_CreateDesign";
import {Hono} from "hono";
import {cors} from "hono/cors";

const app = new Hono<{
	Bindings: {
		Database: D1Database;
	};
}>().get("/", c => c.json({message: "Hello from Hono!"}));
export type HonoApp = typeof app;

app.use("*", cors());
app.use("*", async (context, next) => {
	await next();

	if (context.error) {
		console.error(JSON.stringify(context.error));
	}
});

listenForGetDesignsGETRequest(app);
listenForCreateDesignPOSTRequest(app);
listenForDeleteDesignDELETERequest(app);

export default app;
