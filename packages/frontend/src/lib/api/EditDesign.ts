import {
	apiUpdateDesignResponseSchema,
	type APIUpdateDesignRequest,
	type APIUpdateDesignResponse,
} from "@shared/models/api/APIUpdateDesignRequestSchema";
import {API_URL} from "@src/lib/api/constants/ApiConstants";

export class EditDesignError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly type: "notFound" | "network" | "unknown" | "captcha" | "unauthorized",
	) {
		super(message);
		this.name = "EditDesignError";
	}
}

export const apiUpdateDesign = async (
	id: string,
	editToken: string,
	input: APIUpdateDesignRequest,
): Promise<APIUpdateDesignResponse> => {
	const response = await fetch(`${API_URL}/designs/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: editToken,
		},
		body: JSON.stringify(input),
	});

	if (response.status === 404) {
		throw new EditDesignError("Design not found", 404, "notFound");
	}

	if (response.status === 401) {
		throw new EditDesignError(
			"Your ownership of this design could not be verified. Please clone it instead.",
			401,
			"unauthorized",
		);
	}

	if (response.status === 403) {
		throw new EditDesignError("CAPTCHA validation failed", 403, "captcha");
	}

	if (!response.ok) {
		throw new EditDesignError("Failed to create design", response.status, "unknown");
	}

	const json = await response.json();

	const newDesign = await apiUpdateDesignResponseSchema.safeParseAsync(json);
	if (!newDesign.success) {
		throw new EditDesignError("Invalid response from server", 500, "unknown");
	}

	return newDesign.data;
};
