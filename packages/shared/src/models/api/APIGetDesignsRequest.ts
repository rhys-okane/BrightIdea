import z from "zod";
import {animationFrameSchema} from "../../types/AnimationFrame";
import {stringToDate} from "./utils/StringToDateCodec";

export const apiGetDesignsResponseSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		frames: z.array(animationFrameSchema),
		createdBy: z.string(),
		createdAt: stringToDate,
	}),
);
export type APIGetDesignsResponse = z.infer<typeof apiGetDesignsResponseSchema>;
