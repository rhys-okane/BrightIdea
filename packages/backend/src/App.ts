import { Hono } from "hono";
import { cors } from "hono/cors";
import { listenForCreateDesignPOSTRequest } from "./routes/designs/POST_CreateDesign";
import { listenForGetDesignsGETRequest } from "./routes/designs/GET_GetAllDesigns";
import type { InvocationContext } from "@azure/functions";
import { listenForUpdateDesignPUTRequest } from "./routes/designs/:id/PUT_UpdateDesign";
import { listenForDeleteDesignDELETERequest } from "./routes/designs/:id/DELETE_DeleteDesign";
import { listenForGetSearchDesignsGETRequest } from "./routes/designs/GET_SearchDesigns";
import { listenForUserMeGETRequest } from "@src/routes/users/GET_Me";

export interface HonoContext {
  Bindings: {
    azureContext: InvocationContext;
  };
}

const app = new Hono<HonoContext>().get("/", (c) =>
  c.json({ message: "Hello from Hono!" })
);
export type HonoApp = typeof app;

app.use("*", cors());
app.use("*", async (context, next) => {
  await next();

  if (context.error) {
    context.env.azureContext.error(context.error);
  }
});

app.onError((err, context) => {
  context.env.azureContext.error(err);

  return context.json({ message: "Internal Server Error" }, 500);
});

listenForGetDesignsGETRequest(app);
listenForGetSearchDesignsGETRequest(app);
listenForCreateDesignPOSTRequest(app);
listenForDeleteDesignDELETERequest(app);
listenForUpdateDesignPUTRequest(app);

listenForUserMeGETRequest(app);

export default app;
