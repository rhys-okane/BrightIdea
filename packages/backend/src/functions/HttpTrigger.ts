import {app} from "@azure/functions";
import {azureHonoHandler} from "@marplex/hono-azurefunc-adapter";
import honoApp from "../App";

app.http("httpTrigger", {
	methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
	authLevel: "anonymous",
	route: "{*proxy}",
	handler: azureHonoHandler(honoApp.fetch),
});
