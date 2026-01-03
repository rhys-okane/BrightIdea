import z from "zod";
import { animationFrameSchema } from "../../../../types/AnimationFrame";
import { stringToDate } from "../StringToDateCodec";

export const apiDesignSchema = z.object({
  id: z.string(),
  name: z.string(),
  frames: z.array(animationFrameSchema),
  createdBy: z.string(),
  createdAt: stringToDate,
  updatedAt: stringToDate,
});
