import type {HttpRequest, InvocationContext} from "@azure/functions";
import {newRequestFromAzureFunctions} from "./request";
import {newAzureFunctionsResponse} from "./response";

export type FetchCallback = (request: Request, env: Record<string, unknown>) => Promise<Response> | Response;

export function azureHonoHandler(honoFetch: FetchCallback) {
	return async (request: HttpRequest, _context: InvocationContext) =>
		newAzureFunctionsResponse(
			await honoFetch(newRequestFromAzureFunctions(request), {
				azureContext: _context,
			}),
		);
}
