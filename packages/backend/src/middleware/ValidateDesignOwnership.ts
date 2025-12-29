import {createMiddleware} from "hono/factory";
import {isValid as isValidUlid} from "ulid";
import {type HonoContext} from "@src/App";
import type {DesignDataModel} from "@src/database/types/Design";
import {getDesignByNameQuery} from "@src/database/queries/GetDesignByName";
import {getDesignByIdQuery} from "@src/database/queries/GetDesignById";

export const validateDesignOwnership = createMiddleware<
	HonoContext & {
		Variables: {
			design: DesignDataModel;
		};
	}
>(async (context, next) => {
	const editToken = context.req.header("Authorization");
	if (!editToken || !isValidUlid(editToken)) {
		return context.json({message: "Missing or invalid edit token"}, 401);
	}

	const id = context.req.param("id");
	if (!id || !isValidUlid(id)) {
		return context.json({message: "Missing or invalid design ID"}, 401);
	}

	context.env.azureContext.log(`Validating design ownership for design ID: ${id}`);

	const design = await getDesignByIdQuery(id);
	if (!design) {
		context.env.azureContext.log(`Design not found for ID: ${id}`);
		return context.json({message: "Design not found"}, 404);
	}

	if (design.editToken !== editToken) {
		return context.json({message: "Invalid edit token"}, 401);
	}

	context.env.azureContext.log(`Design ownership validated for design ID: ${id}`);

	context.set("design", design);

	return await next();
});
