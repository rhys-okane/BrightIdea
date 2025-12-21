import type {D1Database} from "@cloudflare/workers-types";
import {Hono} from "hono";
import {cors} from "hono/cors";

export type HonoBindings = {
	Bindings: {
		Database: D1Database;
	};
};

const app = new Hono<HonoBindings>().get("/", c => c.json({message: "Hello from Hono!"}));
export type HonoApp = typeof app;

app.use("*", cors());
app.use("*", async (context, next) => {
	await next();

	if (context.error) {
		console.error(JSON.stringify(context.error));
	}
});

// listenForGetDesignsGETRequest(app);
// listenForCreateDesignPOSTRequest(app);
// listenForDeleteDesignDELETERequest(app);
// listenForUpdateDesignPUTRequest(app);

export default app;
