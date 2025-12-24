import type {HonoContext} from "@src/App";
import {getIp} from "@src/middleware/utils/GetIp";
import {validateTurnstileToken} from "@src/middleware/utils/ValidateTurnstileToken";
import {createMiddleware} from "hono/factory";

export const validateTurnstileTokenFromJsonBody = createMiddleware<HonoContext>(async (context, next) => {
	const json = await context.req.json();

	if (!json.turnstileToken || typeof json.turnstileToken !== "string") {
		return context.json({message: "Missing or invalid CAPTCHA token"}, 403);
	}

	const ip = getIp(context);
	const turnstileResult = await validateTurnstileToken(json.turnstileToken, ip);

	if (!turnstileResult.success) {
		return context.json({message: "CAPTCHA validation failed", errors: turnstileResult.errors}, 403);
	}

	return await next();
});
