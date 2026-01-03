import { stringToDate } from "@shared/models/api/utils/StringToDateCodec";
import { animationFrameSchema } from "@shared/types/AnimationFrame";
import z from "zod";

export const designDataModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  frames: z.array(animationFrameSchema),
  editToken: z.string(),
  createdBy: z.string(),
  createdAt: stringToDate,
  updatedAt: stringToDate,
});

export type DesignDataModel = z.infer<typeof designDataModelSchema>;
