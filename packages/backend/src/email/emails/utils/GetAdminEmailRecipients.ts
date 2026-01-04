import type { EmailAddress } from "@azure/communication-email";
import { auth0ManagementClient } from "@src/auth/Auth0Client";
import { AUTH0_ADMIN_ROLE_ID } from "@src/constants/Auth0Constants";

export async function getAdminEmailRecipients(): Promise<EmailAddress[]> {
  const usersWithAdminRole = await auth0ManagementClient.roles.users.list(
    AUTH0_ADMIN_ROLE_ID
  );

  const usersWhoHaveEmails = usersWithAdminRole.data
    .map((user) => {
      if (!user.email) {
        return undefined;
      }

      return {
        address: user.email,
        displayName: user.name,
      };
    })
    .filter((user) => user !== undefined);

  return usersWhoHaveEmails;
}
