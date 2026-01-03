import z from "zod";
import { apiDesignSchema } from "./utils/types/APIDesign";

export const apiGetDesignsResponseSchema = z.object({
  designs: apiDesignSchema.array(),
  hasNextPage: z.boolean(),
});
export type APIGetDesignsResponse = z.infer<typeof apiGetDesignsResponseSchema>;
