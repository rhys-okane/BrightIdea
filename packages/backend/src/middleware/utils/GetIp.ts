import type {Context} from "hono";

export function getIp(context: Context): string | "unknown" {
	return context.req.header("X-Forwarded-For") || context.req.header("x-azure-clientip") || "unknown";
}
