import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const useGalleryViewState = (): UseZustandState<HighBrow["isInGalleryView"]> => [
	useHighBrowStore(state => state.isInGalleryView),
	useHighBrowStore(state => state.setIsInGalleryView),
];
