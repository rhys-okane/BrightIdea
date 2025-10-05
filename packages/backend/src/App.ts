import type {D1Database} from "@cloudflare/workers-types";
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

listenForGetDesignsGETRequest(app);
listenForCreateDesignPOSTRequest(app);

export default app;
