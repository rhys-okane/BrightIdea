import {DefaultAzureCredential} from "@azure/identity";
import {CosmosClient} from "@azure/cosmos";

const credential = new DefaultAzureCredential();

if (!process.env["COSMOS_ENDPOINT"]) {
	throw new Error("COSMOS_ENDPOINT environment variable is not set");
}

export const cosmosDbClient = new CosmosClient({
	endpoint: process.env["COSMOS_ENDPOINT"],
	aadCredentials: credential,
});

export const database = cosmosDbClient.database("cosmosdb-database");
export const designsContainer = database.container("designs-container");
