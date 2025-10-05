import z from "zod";
import {animationFrameSchema} from "../../types/AnimationFrame";
import {stringToDate} from "./utils/StringToDateCodec";

export const apiCreateDesignRequestSchema = z.object({
	name: z.string().min(1).max(100),
	createdBy: z.string().min(1),
	frames: z.array(animationFrameSchema).min(1),
	turnstileToken: z.string().min(1),
});

export type APICreateDesignRequest = z.infer<typeof apiCreateDesignRequestSchema>;

export const apiCreateDesignResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	// TODO: Should this be a JWT of some kind?
	editToken: z.ulid(),
	frames: z.array(animationFrameSchema),
	createdBy: z.string(),
	createdAt: stringToDate,
});
export type APICreateDesignResponse = z.infer<typeof apiCreateDesignResponseSchema>;
