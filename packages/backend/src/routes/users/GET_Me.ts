import type { HonoApp } from "@src/App";
import { auth0ManagementClient } from "@src/auth/Auth0Client";
import { AUTH0_ADMIN_ROLE_ID } from "@src/constants/Auth0Constants";
import { authRequired } from "@src/middleware/AuthRequired";

export function listenForUserMeGETRequest(app: HonoApp) {
  app.get("/api/users/me", authRequired, async (context) => {
    const jwtPayload = context.get("jwtPayload");

    const roles = await auth0ManagementClient.users.roles.list(jwtPayload.sub);

    const isAdmin = roles.data.some((role) => role.id === AUTH0_ADMIN_ROLE_ID);

    return context.json({
      isAdmin,
    });
  });
}
