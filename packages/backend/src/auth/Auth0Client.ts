import { ManagementClient } from "auth0";

export const auth0Domain = process.env["AUTH0_MANAGEMENT_DOMAIN"];
const clientId = process.env["AUTH0_MANAGEMENT_CLIENT_ID"];
const clientSecret = process.env["AUTH0_MANAGEMENT_CLIENT_SECRET"];

if (!auth0Domain) {
  throw new Error("Missing AUTH0_MANAGEMENT_DOMAIN environment variable");
}

if (!clientId) {
  throw new Error("Missing AUTH0_MANAGEMENT_CLIENT_ID environment variable");
}

if (!clientSecret) {
  throw new Error(
    "Missing AUTH0_MANAGEMENT_CLIENT_SECRET environment variable"
  );
}

export const auth0ManagementClient = new ManagementClient({
  domain: auth0Domain,
  clientId,
  clientSecret,
});
