import {searchClient} from "../AISearch";
import {aiSearchIndexDocumentSchema, type AISearchIndexDocument} from "../types/AISearchIndexDocument";

interface AISearchSearchDesignsResult {
	items: AISearchIndexDocument[];
	totalCount: number;
}

export async function aiSearchSearchDesigns(
	query: string | undefined,
	pageNumber: number,
	pageSize: number,
): Promise<AISearchSearchDesignsResult> {
	const searchResponse = await searchClient.search(query, {
		includeTotalCount: true,
		skip: (pageNumber - 1) * pageSize,
		top: pageSize,
	});

	const items: AISearchIndexDocument[] = [];
	for await (const result of searchResponse.results) {
		const parsed = aiSearchIndexDocumentSchema.parse(result.document);
		items.push(parsed);
	}

	return {
		items,
		totalCount: searchResponse.count ?? 0,
	};
}
