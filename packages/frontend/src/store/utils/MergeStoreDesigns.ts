import type {APIGetDesignsResponse} from "@shared/models/api/APIGetDesignsRequest";
import {type MyStoreDesign, type SomeoneElsesStoreDesign} from "@src/store/types/design/StoreDesign";

export function extractOthersDesignsFromAPI(
	myDesigns: MyStoreDesign[],
	apiDesigns: APIGetDesignsResponse,
): SomeoneElsesStoreDesign[] {
	const myDesignsMap: Map<string, MyStoreDesign> = new Map(myDesigns.map(design => [design.id, design]));

	const othersDesigns = apiDesigns
		.filter(apiDesign => !myDesignsMap.has(apiDesign.id))
		.map<SomeoneElsesStoreDesign>(apiDesign => ({
			...apiDesign,
			isMine: false,
		}));

	return othersDesigns;
}
