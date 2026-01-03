import { type HonoContext } from "@src/App";
import { auth0ManagementClient } from "@src/auth/Auth0Client";
import { AUTH0_ADMIN_ROLE_ID } from "@src/constants/Auth0Constants";
import { validateJwt, type JwtPayload } from "@src/middleware/AuthRequired";
import { createMiddleware } from "hono/factory";

export const adminRequired = createMiddleware<
  HonoContext & {
    Variables: {
      jwtPayload: JwtPayload;
    };
  }
>(async (context, next) => {
  const authHeader = context.req.header("Authorization");
  if (!authHeader) {
    return context.json({ message: "Authorization header missing" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  if (token.length === 0) {
    return context.json({ message: "Token missing" }, 401);
  }

  try {
    const payload = await validateJwt(token);

    const user = await auth0ManagementClient.users.roles.list(payload.sub!);
    if (!user.response.roles?.some((role) => role.id === AUTH0_ADMIN_ROLE_ID)) {
      return context.json({ message: "Admin privileges required" }, 403);
    }

    context.set("jwtPayload", payload as unknown as JwtPayload);
    return await next();
  } catch (error) {
    context.env.azureContext.warn("Admin verification failed", error);
    return context.json({ message: "Invalid token" }, 401);
  }
});
