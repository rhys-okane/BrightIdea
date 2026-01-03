import type { DesignDataModel } from "@src/database/types/Design";
import { emailClient } from "../EmailClient";
import type { InvocationContext } from "@azure/functions";
import { auth0ManagementClient } from "@src/auth/Auth0Client";
import { AUTH0_ADMIN_ROLE_ID } from "@src/constants/Auth0Constants";

export const sendDesignCreateNotificationEmail = async (
  design: DesignDataModel,
  azureContext: InvocationContext
) => {
  azureContext.log(
    `Sending design creation notification email for design ID: ${design.id}`
  );

  const usersWithAdminRole = await auth0ManagementClient.roles.users.list(
    AUTH0_ADMIN_ROLE_ID
  );

  const usersWhoHaveEmails = usersWithAdminRole.data.filter(
    (user) => user.email !== undefined
  );

  const poller = await emailClient.beginSend({
    senderAddress: `no-reply@${process.env.EMAIL_SENDER_DOMAIN}`,
    content: {
      subject: "New Design Created",
      plainText: `A new design named "${design.name}" has been created by "${design.createdBy}" in the Bright Idea application.`,
      html: `<html><body><h1>New Design Created</h1><p>A new design named "${design.name}" has been created by "${design.createdBy}" in the Bright Idea application.</p></body></html>`,
    },
    recipients: {
      cc: usersWhoHaveEmails.map((user) => ({
        address: user.email!,
        displayName: user.name,
      })),
    },
  });

  const result = await poller.pollUntilDone();

  if (result.status !== "succeeded") {
    azureContext.log(
      `Failed to send design creation notification email for design ID: ${design.id}. Status: ${result.status}`
    );
    throw new Error(
      `Failed to send design creation notification email. Status: ${result.status}`
    );
  }
  azureContext.log(
    `Design creation notification email sent successfully for design ID: ${design.id}`
  );
};
