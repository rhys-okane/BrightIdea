import {apiFetchDesigns} from "@src/lib/api/FetchDesigns";
import {useMyDesignsState} from "@src/store/hooks/UseDesignsState";
import {useIsLoadingDesignsState} from "@src/store/hooks/UseIsLoadingDesignsState";
import {extractOthersDesignsFromAPI} from "@src/store/utils/MergeStoreDesigns";
import {useHighBrowStore} from "@src/store/ZustandStore";
import {useRef} from "react";
import {toast} from "react-toastify";

export const useApiDesignSync = () => {
	const hasFetched = useRef(false);
	const [, setIsLoadingDesigns] = useIsLoadingDesignsState();
	const setOthersDesigns = useHighBrowStore(state => state.setOthersDesigns);
	const [myDesigns] = useMyDesignsState();

	if (!hasFetched.current) {
		console.log("page rerendered");
		if (!window.navigator.onLine) {
			return void toast.info("You are offline, but you can still play any pre-existing designs.");
		}
		setIsLoadingDesigns(true);

		(async () => {
			try {
				const designs = await apiFetchDesigns(1);
				setOthersDesigns(extractOthersDesignsFromAPI(myDesigns, designs));

				toast.success("Designs downloaded");
			} catch (error) {
				console.error("Failed to fetch designs:", error);
				toast.error("Failed to fetch designs");
			} finally {
				setIsLoadingDesigns(false);
			}
		})();

		hasFetched.current = true;
	}
};
