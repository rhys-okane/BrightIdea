import type {Context} from "hono";

export function getIp(context: Context): string | "unknown" {
	return context.req.header("CF-Connecting-IP") || context.req.header("X-Forwarded-For") || "unknown";
}
