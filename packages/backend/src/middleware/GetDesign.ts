// import type {D1Database} from "@cloudflare/workers-types";
// import {db} from "@src/database/connection";
// import {designsTable} from "@src/database/schema/Designs";
// import {eq, type InferSelectModel} from "drizzle-orm";
// import {createMiddleware} from "hono/factory";
// import {isValid as isValidUlid} from "ulid";

// export const validateUlidParam = createMiddleware<{
//   Bindings: {
//     Database: D1Database;
//   },
//   Variables: {
//     design: InferSelectModel<typeof designsTable>;
//   }
// }>(async (context, next) => {
//   const id = context.req.param("id");
//   if (!id || !isValidUlid(id)) {
//     return context.json({message: "Invalid design ID"}, 400);
//   }

//   const item = await db(context.env.Database).select().from(designsTable).where(eq(designsTable.id, id)).get();

//   if (!item) {
//     return context.json({message: "Design not found"}, 404);
//   }

//   context.set("design", item);

//   return await next();
// });
