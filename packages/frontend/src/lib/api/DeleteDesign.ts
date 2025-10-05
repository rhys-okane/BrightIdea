import {API_URL} from "@src/lib/api/constants/ApiConstants";
import type {MyStoreDesign} from "@src/store/types/design/StoreDesign";

export async function apiDeleteDesign(design: MyStoreDesign, turnstileToken: string): Promise<boolean> {
	const response = await fetch(`${API_URL}/designs/${design.id}`, {
		method: "DELETE",
		headers: {
			Authorization: design.editToken,
		},
		body: JSON.stringify({turnstileToken: turnstileToken}),
	});

	return response.ok;
}
