import {
	apiSearchDesignsResponseSchema,
	type APISearchDesignsResponse,
} from "@shared/models/api/APISearchDesignsRequestSchema";
import {API_URL} from "@src/lib/api/constants/ApiConstants";

export const apiSearchDesigns = async (
	query: string | undefined,
	page: number,
	pageSize: number,
	abortSignal?: AbortSignal,
): Promise<APISearchDesignsResponse> => {
	const queryParams = new URLSearchParams();
	if (query !== undefined) {
		queryParams.append("query", query);
	}
	queryParams.append("page", page.toString());
	queryParams.append("pageSize", pageSize.toString());

	const response = await fetch(`${API_URL}/designs/search?${queryParams.toString()}`, {
		method: "GET",
		signal: abortSignal,
	});

	if (!response.ok) {
		throw new Error("Failed to fetch designs");
	}

	const json = await response.json();

	const parsed = await apiSearchDesignsResponseSchema.safeParseAsync(json);
	if (!parsed.success) {
		throw new Error("Failed to parse designs");
	}

	return parsed.data;
};
