import z from "zod";
import {stringToDate} from "./utils/StringToDateCodec";

const stringToNumber = z.codec(z.string().regex(z.regexes.number), z.number(), {
	decode: str => Number.parseFloat(str),
	encode: num => num.toString(),
});

export const apiGetDesignsRequestSchema = z.object({
	lastSeen: stringToDate.optional(),
	pageSize: stringToNumber
		.refine(num => num > 0 && num <= 100, {
			message: "Page size must be between 1 and 100",
		})
		.optional()
		.default(20),
});
