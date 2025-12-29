import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export async function getDesignByIdQuery(id: string): Promise<DesignDataModel | undefined> {
	return (await designsContainer.item(id, id).read<DesignDataModel>()).resource;
}
