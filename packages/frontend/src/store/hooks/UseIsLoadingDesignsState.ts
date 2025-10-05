import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const useIsLoadingDesignsState = (): UseZustandState<HighBrow["isLoadingDesigns"]> => [
	useHighBrowStore(state => state.isLoadingDesigns),
	useHighBrowStore(state => state.setIsLoadingDesigns),
];
