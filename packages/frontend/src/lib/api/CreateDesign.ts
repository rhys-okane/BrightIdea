import type {APICreateDesignRequest} from "@shared/models/api/APICreateDesignRequest";

export const apiCreateDesign = async (input: APICreateDesignRequest) => {
	console.log(import.meta);
	const response = await fetch(`${import.meta.env.VITE_API_URL}/designs`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		throw new Error("Failed to create design");
	}

	return response.json();
};
