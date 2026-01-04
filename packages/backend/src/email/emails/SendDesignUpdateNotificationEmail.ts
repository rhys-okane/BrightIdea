import type { DesignDataModel } from "@src/database/types/Design";
import { emailClient } from "../EmailClient";
import type { InvocationContext } from "@azure/functions";
import { getAdminEmailRecipients } from "@src/email/emails/utils/GetAdminEmailRecipients";
import { EMAIL_SENDER_ADDRESS } from "@src/constants/EmailConstants";

export const sendDesignUpdateNotificationEmail = async (
  design: DesignDataModel,
  azureContext: InvocationContext
) => {
  azureContext.log(
    `Sending design update notification email for design ID: ${design.id}`
  );

  const poller = await emailClient.beginSend({
    senderAddress: EMAIL_SENDER_ADDRESS,
    content: {
      subject: "Design Updated",
      plainText: `The design named "${design.name}" has been updated by "${design.createdBy}" in the Bright Idea application.`,
      html: `<html><body><h1>Design Updated</h1><p>The design named "${design.name}" has been updated by "${design.createdBy}" in the Bright Idea application.</p></body></html>`,
    },
    recipients: {
      cc: await getAdminEmailRecipients(),
    },
  });

  const result = await poller.pollUntilDone();

  if (result.status !== "succeeded") {
    azureContext.log(
      `Failed to send design update notification email for design ID: ${design.id}. Status: ${result.status}`
    );
    throw new Error(
      `Failed to send design update notification email. Status: ${result.status}`
    );
  }
  azureContext.log(
    `Design update notification email sent successfully for design ID: ${design.id}`
  );
};
