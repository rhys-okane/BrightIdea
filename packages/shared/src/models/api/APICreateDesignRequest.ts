import z from "zod";
import {animationFrameSchema} from "../../types/AnimationFrame";

export const apiCreateDesignRequestSchema = z.object({
	name: z.string().min(1).max(100),
	createdBy: z.string().min(1),
	design: z.array(animationFrameSchema).min(1),
});
