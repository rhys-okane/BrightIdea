import type { HonoApp } from "@src/App";
import { apiUpdateDesignRequestSchema } from "@shared/models/api/APIUpdateDesignRequestSchema";
import { validateDesignOwnership } from "@src/middleware/ValidateDesignOwnership";
import { zValidator } from "@hono/zod-validator";
import { validateTurnstileTokenFromJsonBody } from "@src/middleware/ValidateTurnstileToken";
import { updateDesignQuery } from "@src/database/queries/UpdateDesign";
import type { DesignDataModel } from "@src/database/types/Design";
import { aiSearchUpdateDesign } from "@src/search/actions/UpdateDesign";
import { sendDesignUpdateNotificationEmail } from "@src/email/emails/SendDesignUpdateNotificationEmail";

export function listenForUpdateDesignPUTRequest(app: HonoApp) {
  app.put(
    "/designs/:id",
    validateTurnstileTokenFromJsonBody,
    validateDesignOwnership,
    zValidator("json", apiUpdateDesignRequestSchema),
    async (context) => {
      const body = context.req.valid("json");

      const updatedDesign: DesignDataModel = {
        ...context.var.design,
        name: body.name,
        frames: body.frames,
        updatedAt: new Date(),
        createdBy: body.createdBy,
      };

      await updateDesignQuery(updatedDesign);
      await aiSearchUpdateDesign(updatedDesign);

      context.json(updatedDesign);

      // Send email notification asynchronously
      await sendDesignUpdateNotificationEmail(updatedDesign, context.env.azureContext).catch((error) => {
        context.env.azureContext.warn("Failed to send design update notification email", error);
      });
    }
  );
}
