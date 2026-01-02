import type {APIGetDesignsResponse} from "@shared/models/api/APIGetDesignsRequest";
import type {AISearchIndexDocument} from "../types/AISearchIndexDocument";

export function designSearchIndexDocumentToSearchResponse(
	searchIndexDocument: AISearchIndexDocument,
): APIGetDesignsResponse["designs"][number] {
	return {
		id: searchIndexDocument.id,
		name: searchIndexDocument.name,
		frames: searchIndexDocument.framesJson,
		createdBy: searchIndexDocument.createdBy,
		createdAt: searchIndexDocument.createdAt,
		updatedAt: searchIndexDocument.updatedAt,
	};
}
