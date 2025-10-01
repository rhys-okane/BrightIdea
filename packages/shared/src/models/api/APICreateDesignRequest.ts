import z from "zod";
import {animationFrameSchema} from "../../types/AnimationFrame";

export const apiCreateDesignRequestSchema = z.object({
	name: z.string().min(1).max(100),
	createdBy: z.string().min(1),
	design: z.array(animationFrameSchema).min(1),
});

export const apiCreateDesignResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	editToken: z.string(),
	design: z.array(animationFrameSchema),
	createdBy: z.string(),
	createdAt: z.iso.date(),
});
