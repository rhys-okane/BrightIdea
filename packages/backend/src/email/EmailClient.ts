import {DefaultAzureCredential} from "@azure/identity";
import {EmailClient} from "@azure/communication-email";

if (!process.env.EMAIL_SERVICE_ENDPOINT) {
	throw new Error("Missing EMAIL_SERVICE_ENDPOINT environment variable");
}

if (!process.env.EMAIL_SENDER_DOMAIN) {
	throw new Error("Missing EMAIL_SENDER_DOMAIN environment variable");
}

const credential = new DefaultAzureCredential();
export const emailClient = new EmailClient(process.env.EMAIL_SERVICE_ENDPOINT, credential);
