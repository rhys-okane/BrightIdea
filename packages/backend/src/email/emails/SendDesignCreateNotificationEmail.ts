import type { DesignDataModel } from "@src/database/types/Design";
import { emailClient } from "../EmailClient";
import type { InvocationContext } from "@azure/functions";
import { getAdminEmailRecipients } from "@src/email/emails/utils/GetAdminEmailRecipients";
import { EMAIL_SENDER_ADDRESS } from "@src/constants/EmailConstants";

export const sendDesignCreateNotificationEmail = async (
  design: DesignDataModel,
  azureContext: InvocationContext
) => {
  azureContext.log(
    `Sending design creation notification email for design ID: ${design.id}`
  );

  const poller = await emailClient.beginSend({
    senderAddress: EMAIL_SENDER_ADDRESS,
    content: {
      subject: "New Design Created",
      plainText: `A new design named "${design.name}" has been created by "${design.createdBy}" in the Bright Idea application.`,
      html: `<html><body><h1>New Design Created</h1><p>A new design named "${design.name}" has been created by "${design.createdBy}" in the Bright Idea application.</p></body></html>`,
    },
    recipients: {
      cc: await getAdminEmailRecipients(),
    },
  });

  const result = await poller.pollUntilDone();

  if (result.status !== "Succeeded") {
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
