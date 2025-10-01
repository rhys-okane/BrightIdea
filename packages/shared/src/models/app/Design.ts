import z from "zod";
import {animationFrameSchema} from "../../types/AnimationFrame";

export const designSchema = z.object({
	id: z.string(),
	name: z.string(),
	editToken: z.string(),
	design: z.array(animationFrameSchema),
	createdBy: z.string(),
	createdAt: z.iso.date(),
});
export type Design = z.infer<typeof designSchema>;
