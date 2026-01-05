import {animationFrameSchema} from "@shared/types/AnimationFrame";
import {z} from "zod";

const jsonAnimationFrameArraySchema = z.codec(z.string(), animationFrameSchema.array(), {
	encode: frames => {
		return JSON.stringify(frames);
	},
	decode: (framesJson: string) => {
		return z.array(animationFrameSchema).parse(JSON.parse(framesJson));
	},
});

export const aiSearchIndexDocumentSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdBy: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	frameCount: z.number().int().nonnegative(),
	totalDuration: z.number().int().nonnegative(),
	dominantColors: z.array(z.string()),
	framesJson: jsonAnimationFrameArraySchema,
	mediaFileNames: z.array(z.string()),
});

export type AISearchIndexDocument = z.infer<typeof aiSearchIndexDocumentSchema>;
