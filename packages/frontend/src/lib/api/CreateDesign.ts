import {
	apiCreateDesignResponseSchema,
	type APICreateDesignRequest,
	type APICreateDesignResponse,
} from "@shared/models/api/APICreateDesignRequest";

export class CreateDesignError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly type: "conflict" | "network" | "unknown",
	) {
		super(message);
		this.name = "CreateDesignError";
	}
}

export const apiCreateDesign = async (input: APICreateDesignRequest): Promise<APICreateDesignResponse> => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/designs`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});

	if (response.status === 409) {
		throw new CreateDesignError("Design with the same name already exists", 409, "conflict");
	}

	if (!response.ok) {
		throw new CreateDesignError("Failed to create design", response.status, "unknown");
	}

	const json = await response.json();

	const newDesign = await apiCreateDesignResponseSchema.safeParseAsync(json);
	if (!newDesign.success) {
		throw new CreateDesignError("Invalid response from server", 500, "unknown");
	}

	return newDesign.data;
};
