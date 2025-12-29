import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export const deleteDesignQuery = (designId: string) => {
	return designsContainer.item(designId, designId).delete<DesignDataModel>();
};
