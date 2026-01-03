import z from "zod";
import { apiDesignSchema } from "./utils/types/APIDesign";
import { stringToNumber } from "./utils/StringToNumberCodec";

export const apiSearchDesignsRequestSchema = z.object({
  query: z.string().max(100).optional(),
  page: stringToNumber
    .refine((num) => num > 0, {
      message: "Page must be greater than 0",
    })
    .default(1),
  pageSize: stringToNumber
    .refine((num) => num > 0 && num <= 100, {
      message: "Page size must be between 1 and 100",
    })
    .default(20),
});

export const apiSearchDesignsResponseSchema = z.object({
  designs: apiDesignSchema.array(),
  totalCount: z.number().int().min(0),
});

export type APISearchDesignsRequest = z.infer<
  typeof apiSearchDesignsRequestSchema
>;
export type APISearchDesignsResponse = z.infer<
  typeof apiSearchDesignsResponseSchema
>;
