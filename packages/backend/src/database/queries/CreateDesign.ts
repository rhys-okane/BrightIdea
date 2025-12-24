import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export async function createDesignQuery(design: DesignDataModel): Promise<void> {
	await designsContainer.items.create<DesignDataModel>(design);
}
