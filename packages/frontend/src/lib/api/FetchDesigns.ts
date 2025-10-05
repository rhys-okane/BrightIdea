import {apiGetDesignsResponseSchema, type APIGetDesignsResponse} from "@shared/models/api/APIGetDesignsRequest";
import {API_URL} from "@src/lib/api/constants/ApiConstants";

export const apiFetchDesigns = async (pageNumber: number): Promise<APIGetDesignsResponse> => {
	const response = await fetch(`${API_URL}/designs?page=${pageNumber}&pageSize=100`, {
		method: "GET",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch designs");
	}

	const json = await response.json();

	const parsed = await apiGetDesignsResponseSchema.safeParseAsync(json);
	if (!parsed.success) {
		throw new Error("Failed to parse designs");
	}

	return parsed.data;
};
