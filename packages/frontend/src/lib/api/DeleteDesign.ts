import {API_URL} from "@src/lib/api/constants/ApiConstants";
import type {MyStoreDesign} from "@src/store/types/design/StoreDesign";

export async function deleteDesign(design: MyStoreDesign): Promise<boolean> {
	const response = await fetch(`${API_URL}/designs/${design.id}`, {
		method: "DELETE",
		headers: {
			Authorization: design.editToken,
		},
	});

	return response.ok;
}
