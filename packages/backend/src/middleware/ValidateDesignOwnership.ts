// import { db } from "@src/database/connection";
// import { designsTable } from "@src/database/schema/Designs";
// import { eq, type InferSelectModel } from "drizzle-orm";
// import { createMiddleware } from "hono/factory";
// import { isValid as isValidUlid } from "ulid";
// import { type HonoBindings } from "@src/App";

// export const validateDesignOwnership = createMiddleware<
//   HonoBindings & {
//     Variables: {
//       design: InferSelectModel<typeof designsTable>;
//     };
//   }
// >(async (context, next) => {
//   const editToken = context.req.header("Authorization");
//   if (!editToken || !isValidUlid(editToken)) {
//     return context.json({ message: "Missing or invalid edit token" }, 401);
//   }

//   const id = context.req.param("id");
//   if (!id || !isValidUlid(id)) {
//     return context.json({ message: "Missing or invalid design ID" }, 401);
//   }

//   const design = await db(context.env.Database)
//     .select()
//     .from(designsTable)
//     .where(eq(designsTable.id, id))
//     .get();

//   if (!design) {
//     return context.json({ message: "Design not found" }, 404);
//   }

//   if (design.editToken !== editToken) {
//     return context.json({ message: "Invalid edit token" }, 401);
//   }

//   context.set("design", design);

//   return await next();
// });
