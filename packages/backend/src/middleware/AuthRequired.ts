import type { HonoContext } from "@src/App";
import { auth0Domain } from "@src/auth/Auth0Client";
import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(`https://${auth0Domain}/.well-known/jwks.json`)
);

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  scope: string;
  azp: string;
  permissions: string[];
}

export const authRequired = createMiddleware<
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
    context.set("jwtPayload", payload as unknown as JwtPayload);
  } catch (error) {
    context.env.azureContext.warn("JWT validation failed", error);
    return context.json({ message: "Invalid token" }, 401);
  }

  return await next();
});

export async function validateJwt(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${auth0Domain}/`,
    audience: "https://bright-idea-azure-functions",
  });
  return payload;
}
