import {app} from "@azure/functions";
import honoApp from "../App";
import {azureHonoHandler} from "./azure-hono-app-adapter";

app.http("httpTrigger", {
	methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
	authLevel: "anonymous",
	route: "{*proxy}",
	handler: azureHonoHandler(honoApp.fetch),
});
