import type {Context} from "hono";
import {createMiddleware} from "hono/factory";
import {isValid as isValidUlid} from "ulid";

export const validateEditTokenPresentAndSafe = createMiddleware<{
	Variables: {
		editToken: string;
	};
}>(async (context, next) => {
	const editToken = context.req.header("editToken");
	if (!editToken || !isValidUlid(editToken)) {
		return context.json({message: "Missing or invalid edit token"}, 401);
	}

	context.set("editToken", editToken);

	return await next();
});
