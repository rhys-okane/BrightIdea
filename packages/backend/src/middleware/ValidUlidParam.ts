import {createMiddleware} from "hono/factory";
import {isValid as isValidUlid} from "ulid";

export const validateUlidParam = createMiddleware(async (context, next) => {
	const id = context.req.param("id");
	if (!isValidUlid(id ?? "")) {
		return context.json({message: "Invalid design ID"}, 400);
	}
	return await next();
});
