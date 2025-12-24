// import type { HonoApp } from "@src/App";
// import { db } from "@src/database/connection";
// import { designsTable } from "@src/database/schema/Designs";
// import { eq } from "drizzle-orm";
// import { apiUpdateDesignRequestSchema } from "@shared/models/api/APIUpdateDesignRequestSchema";
// import { validateDesignOwnership } from "@src/middleware/ValidateDesignOwnership";
// import { zValidator } from "@hono/zod-validator";
// import { validateTurnstileTokenFromJsonBody } from "@src/middleware/ValidateTurnstileToken";

// export function listenForUpdateDesignPUTRequest(app: HonoApp) {
//   app.put(
//     "/designs/:id",
//     validateTurnstileTokenFromJsonBody,
//     validateDesignOwnership,
//     zValidator("json", apiUpdateDesignRequestSchema),
//     async (context) => {
//       const body = context.req.valid("json");
//       const id = context.var.design.id;

//       const updatedDesign = await db(context.env.Database)
//         .update(designsTable)
//         .set({
//           name: body.name,
//           frames: body.frames,
//           updatedAt: new Date(),
//           createdBy: body.createdBy,
//         })
//         .where(eq(designsTable.id, id))
//         .returning()
//         .get();

//       return context.json(updatedDesign);
//     }
//   );
// }
