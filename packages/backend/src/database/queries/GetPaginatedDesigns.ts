import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export const getPaginatedDesignsQuery = async (pageSize: number, lastSeen: Date | undefined) => {
	const feedResponse = await designsContainer.items
		.query<DesignDataModel>({
			query: "SELECT TOP @pageSize * FROM c WHERE c.createdAt > @lastSeen ORDER BY c.createdAt",
			parameters: [
				{name: "@pageSize", value: pageSize + 1},
				{name: "@lastSeen", value: lastSeen ?? new Date(0)},
			],
		})
		.fetchAll();

	return {
		designs: feedResponse.resources.slice(0, pageSize),
		hasNextPage: feedResponse.resources.length > pageSize,
	};
};
