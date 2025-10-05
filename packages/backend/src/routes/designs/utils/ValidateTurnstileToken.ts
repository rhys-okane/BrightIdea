import {Resource} from "sst";

interface TurnstileResult {
	success: boolean;
	errors: string[];
}

export async function validateTurnstileToken(token: string, ip: string | "unknown"): Promise<TurnstileResult> {
	const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			secret: Resource.TurnstileSecretKey.value,
			response: token,
			remoteip: ip,
		}),
	});

	const turnstileResult = await turnstileResponse.json();

	return {
		success: turnstileResult.success,
		errors: turnstileResult["error-codes"] || [],
	};
}
