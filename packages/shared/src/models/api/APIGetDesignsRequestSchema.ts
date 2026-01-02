import z from "zod";
import {stringToDate} from "./utils/StringToDateCodec";
import {stringToNumber} from "./utils/StringToNumberCodec";

export const apiGetDesignsRequestSchema = z.object({
	lastSeen: stringToDate.optional(),
	pageSize: stringToNumber
		.refine(num => num > 0 && num <= 100, {
			message: "Page size must be between 1 and 100",
		})
		.optional()
		.default(20),
});
