import {DefaultAzureCredential} from "@azure/identity";
import {SearchClient} from "@azure/search-documents";

const credential = new DefaultAzureCredential();

const endpoint = process.env["AI_SEARCH_SERVICE_ENDPOINT"];

if (endpoint === undefined || endpoint === "NO_ENDPOINT_FOUND") {
	throw new Error("AI Search Service endpoint not found in environment variables");
}

const indexName = process.env["AI_SEARCH_INDEX_NAME"];

if (indexName === undefined) {
	throw new Error("AI Search Service index name not found in environment variables");
}

export const searchClient = new SearchClient(endpoint, indexName, credential);
