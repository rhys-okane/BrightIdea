import type { HonoApp, HonoContext } from "@src/App";
import { validateDesignOwnership } from "@src/middleware/ValidateDesignOwnership";
import { validateTurnstileTokenFromJsonBody } from "@src/middleware/ValidateTurnstileToken";
import { aiSearchDeleteDesign } from "@src/search/actions/DeleteDesign";
import { createMiddleware } from "hono/factory";
import { getDesign } from "@src/middleware/GetDesign";
import { adminRequired } from "@src/middleware/AdminRequired";
import type { Context } from "hono";
import { deleteDesignQuery } from "@src/database/queries/DeleteDesign";

const determineCorrectMiddlewareChain = createMiddleware(
  async (context, next) => {
    const authHeader = context.req.header("Authorization");
    if (!authHeader) {
      context.json({ message: "Missing Authorization header" }, 401);
      return;
    }

    if (authHeader.startsWith("Bearer ")) {
      context.env.azureContext.log(
        "Using admin authentication for design deletion"
      );
      await adminRequired(context, next);
      return;
    }

    await validateTurnstileTokenFromJsonBody(
      context as Context<HonoContext>,
      async () => {
        await validateDesignOwnership(context, next);
      }
    );
  }
);

export function listenForDeleteDesignDELETERequest(app: HonoApp) {
  app.delete(
    "/designs/:id",
    getDesign,
    determineCorrectMiddlewareChain,
    async (context) => {
      await deleteDesignQuery(context.var.design.id);
      await aiSearchDeleteDesign(context.var.design);

      return context.json({ message: "Design deleted successfully" });
    }
  );
}
