import {designsContainer} from "../connection";
import type {DesignDataModel} from "../types/Design";

export const updateDesignQuery = (updatedDesign: DesignDataModel) => {
	return designsContainer.item(updatedDesign.id, updatedDesign.id).replace<DesignDataModel>(updatedDesign);
};
