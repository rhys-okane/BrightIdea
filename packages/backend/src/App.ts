import type {D1Database} from "@cloudflare/workers-types";
import {listenForCreateDesignPOSTRequest} from "@src/routes/designs/POST_CreateDesign";
import {Hono} from "hono";

interface Bindings {
	Database: D1Database;
}

const app = new Hono<{
	Bindings: Bindings;
}>().get("/", c => c.json({message: "Hello from Hono!"}));

listenForCreateDesignPOSTRequest(app);

export type HonoApp = typeof app;

export default app;
