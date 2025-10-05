import z from "zod";

export const apiDeleteDesignRequestSchema = z.object({
	turnstileToken: z.string(),
});
export type APIDeleteDesignRequest = z.infer<typeof apiDeleteDesignRequestSchema>;
