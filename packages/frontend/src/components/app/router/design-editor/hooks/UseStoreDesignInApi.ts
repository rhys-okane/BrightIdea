import type {TurnstileInstance} from "@marsidev/react-turnstile";
import type {APICreateDesignResponse} from "@shared/models/api/APICreateDesignRequest";
import type {APIUpdateDesignResponse} from "@shared/models/api/APIUpdateDesignRequestSchema";
import {apiCreateDesign, CreateDesignError} from "@src/lib/api/CreateDesign";
import {apiUpdateDesign, EditDesignError} from "@src/lib/api/EditDesign";
import {useEditingDesignState} from "@src/store/hooks/UseEditingDesignState";
import type {EditableStoreDesign, MyStoreDesign, NewStoreDesign} from "@src/store/types/design/StoreDesign";
import {useHighBrowStore} from "@src/store/ZustandStore";
import {useCallback, type RefObject} from "react";
import {toast} from "react-toastify";

async function doApiCall(design: NewStoreDesign, turnstileToken: string): Promise<APICreateDesignResponse>;
async function doApiCall(design: MyStoreDesign, turnstileToken: string): Promise<APIUpdateDesignResponse>;
async function doApiCall(
	design: EditableStoreDesign,
	turnstileToken: string,
): Promise<APICreateDesignResponse | APIUpdateDesignResponse> {
	if (design.isNew) {
		return apiCreateDesign({
			name: design.name,
			createdBy: design.createdBy,
			frames: design.frames,
			turnstileToken,
		});
	}

	return apiUpdateDesign(design.id, design.editToken, {
		name: design.name,
		createdBy: design.createdBy,
		frames: design.frames,
		turnstileToken,
	});
}

export const useStoreDesignInApi = (turnstileRef: RefObject<TurnstileInstance | null>) => {
	const storeMyDesign = useHighBrowStore(state => state.storeMyDesign);
	const [, setEditingDesignId] = useEditingDesignState();

	return useCallback(
		(design: EditableStoreDesign) => {
			(async () => {
				if (!turnstileRef.current) return;
				const turnstileToken = turnstileRef.current.getResponse();
				if (!turnstileToken) {
					alert("Please complete the CAPTCHA challenge before publishing.");
					return;
				}

				const loadingId = toast.loading("Publishing design...", {theme: "dark", autoClose: false});
				try {
					const newDesign = design.isNew
						? await doApiCall(design, turnstileToken)
						: await doApiCall(design, turnstileToken);

					storeMyDesign({
						...newDesign,
						isMine: true,
						isNew: false,
						editToken: design.isNew ? (newDesign as APICreateDesignResponse).editToken : design.editToken,
					});

					toast.update(loadingId, {
						render: "Design published successfully!",
						type: "success",
						isLoading: false,
						autoClose: 3000,
					});
					setEditingDesignId(undefined);
				} catch (error) {
					turnstileRef.current.reset();
					if (error instanceof CreateDesignError || error instanceof EditDesignError) {
						if (error.type === "conflict") {
							toast.update(loadingId, {
								render: "A design with that name already exists. Please choose a different name.",
								type: "error",
								isLoading: false,
								autoClose: 5000,
							});
						}

						if (error.type === "captcha") {
							toast.update(loadingId, {
								render: "CAPTCHA validation failed. Please try again.",
								type: "error",
								isLoading: false,
								autoClose: 5000,
							});
						}

						if (error.type === "notFound") {
							toast.update(loadingId, {
								render: "Design not found. It may have been deleted.",
								type: "error",
								isLoading: false,
								autoClose: 5000,
							});
						}

						if (error.type === "network") {
							toast.update(loadingId, {
								render: "Network error. Please check your connection and try again.",
								type: "error",
								isLoading: false,
								autoClose: 5000,
							});
						}
						return;
					}

					toast.update(loadingId, {
						render: "Failed to publish design. Please try again.",
						type: "error",
						isLoading: false,
						autoClose: 3000,
					});
				}
			})();
		},
		[setEditingDesignId, storeMyDesign, turnstileRef],
	);
};
