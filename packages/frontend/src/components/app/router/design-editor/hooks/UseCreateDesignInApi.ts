import type {TurnstileInstance} from "@marsidev/react-turnstile";
import {apiCreateDesign, CreateDesignError} from "@src/lib/api/CreateDesign";
import {useEditingDesignState} from "@src/store/hooks/UseEditingDesignState";
import type {NewStoreDesign} from "@src/store/types/design/StoreDesign";
import {useHighBrowStore} from "@src/store/ZustandStore";
import {useCallback, type RefObject} from "react";
import {toast} from "react-toastify";

export const useCreateDesignInApi = (turnstyleRef: RefObject<TurnstileInstance | null>) => {
	const storeMyDesign = useHighBrowStore(state => state.storeMyDesign);
	const [, setEditingDesignId] = useEditingDesignState();

	return useCallback((design: NewStoreDesign) => {
		(async () => {
			if (!turnstyleRef.current) return;
			const turnstileToken = turnstyleRef.current.getResponse();
			if (!turnstileToken) {
				alert("Please complete the CAPTCHA challenge before publishing.");
				return;
			}

			const loadingId = toast.loading("Publishing design...", {theme: "dark", autoClose: false});
			try {
				const newDesign = await apiCreateDesign({
					name: design.name,
					createdBy: design.createdBy,
					frames: design.frames,
					turnstileToken,
				});

				storeMyDesign({
					...newDesign,
					isMine: true,
					isNew: false,
				});

				toast.update(loadingId, {
					render: "Design published successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
				});
				setEditingDesignId(undefined);
			} catch (error) {
				if (error instanceof CreateDesignError && error.type === "conflict") {
					toast.update(loadingId, {
						render: "A design with that name already exists. Please choose a different name.",
						type: "error",
						isLoading: false,
						autoClose: 5000,
					});
					return;
				}

				toast.update(loadingId, {
					render: "Failed to publish design. Please try again.",
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				console.error(error);
			}
		})();
	}, []);
};
