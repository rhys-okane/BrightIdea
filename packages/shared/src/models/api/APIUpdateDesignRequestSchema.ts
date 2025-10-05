import z from "zod";
import {animationFrameSchema} from "../../types/AnimationFrame";
import {apiCreateDesignRequestSchema} from "./APICreateDesignRequest";
import {stringToDate} from "./utils/StringToDateCodec";

export const apiUpdateDesignRequestSchema = apiCreateDesignRequestSchema;
export type APIUpdateDesignRequest = z.infer<typeof apiUpdateDesignRequestSchema>;

export const apiUpdateDesignResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	frames: z.array(animationFrameSchema),
	createdBy: z.string(),
	createdAt: stringToDate,
	updatedAt: stringToDate,
});
export type APIUpdateDesignResponse = z.infer<typeof apiUpdateDesignResponseSchema>;
