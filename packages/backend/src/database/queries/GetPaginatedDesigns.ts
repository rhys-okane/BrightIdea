import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export const getPaginatedDesignsQuery = async (pageSize: number, lastSeen: Date | undefined) => {
	const feedResponse = await designsContainer.items
		.query<DesignDataModel>({
			query: "SELECT TOP @pageSize * FROM c WHERE c.createdAt > @lastSeen ORDER BY c.createdAt",
			parameters: [
				{name: "@pageSize", value: pageSize},
				{name: "@lastSeen", value: lastSeen ?? new Date(0)},
			],
		})
		.fetchAll();

	return feedResponse.resources;
};
