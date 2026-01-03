import type { HonoContext } from "@src/App";
import { getDesignByIdQuery } from "@src/database/queries/GetDesignById";
import type { DesignDataModel } from "@src/database/types/Design";
import { createMiddleware } from "hono/factory";
import { isValid as isValidUlid } from "ulid";

export const getDesign = createMiddleware<
  HonoContext & {
    Variables: {
      design: DesignDataModel;
    };
  }
>(async (context, next) => {
  const id = context.req.param("id");
  if (!id || !isValidUlid(id)) {
    return context.json({ message: "Invalid design ID" }, 400);
  }

  const design = await getDesignByIdQuery(id);

  if (!design) {
    return context.json({ message: "Design not found" }, 404);
  }

  context.set("design", design);

  return await next();
});
