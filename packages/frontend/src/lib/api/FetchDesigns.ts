import {apiGetDesignsResponseSchema, type APIGetDesignsResponse} from "@shared/models/api/APIGetDesignsRequest";
import {API_URL} from "@src/lib/api/constants/ApiConstants";

export const apiFetchDesigns = async (pageSize: number, lastSeen: Date | null): Promise<APIGetDesignsResponse> => {
	const query = new URLSearchParams();
	query.append("pageSize", pageSize.toString());
	if (lastSeen) {
		query.append("lastSeen", lastSeen.toISOString());
	}

	const response = await fetch(`${API_URL}/designs?${query.toString()}`, {
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
