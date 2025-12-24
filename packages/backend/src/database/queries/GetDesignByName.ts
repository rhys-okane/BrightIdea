import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export async function getDesignByNameQuery(name: string): Promise<DesignDataModel | undefined> {
	const feedResponse = await designsContainer.items
		.query<DesignDataModel>({
			query: "SELECT * FROM c WHERE c.name = @name",
			parameters: [
				{
					name: "@name",
					value: name,
				},
			],
		})
		.fetchNext();

	return feedResponse.resources[0];
}
