import type {HonoApp} from "@src/App";
import {validateDesignOwnership} from "@src/middleware/ValidateDesignOwnership";
import {validateTurnstileTokenFromJsonBody} from "@src/middleware/ValidateTurnstileToken";
import {deleteDesignQuery} from "@src/database/queries/DeleteDesign";
import {aiSearchDeleteDesign} from "@src/search/actions/DeleteDesign";

export function listenForDeleteDesignDELETERequest(app: HonoApp) {
	app.delete("/designs/:id", validateTurnstileTokenFromJsonBody, validateDesignOwnership, async context => {
		await deleteDesignQuery(context.var.design.id);
		await aiSearchDeleteDesign(context.var.design);

		return context.json({message: "Design deleted successfully"});
	});
}
