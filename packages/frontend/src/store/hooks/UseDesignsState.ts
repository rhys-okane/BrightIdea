import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const useMyDesignsState = (): UseZustandState<HighBrow["myDesigns"]> => [
	useHighBrowStore(state => state.myDesigns),
	useHighBrowStore(state => state.setMyDesigns),
];

export const useOthersDesignsState = (): UseZustandState<HighBrow["othersDesigns"]> => [
	useHighBrowStore(state => state.othersDesigns),
	useHighBrowStore(state => state.setOthersDesigns),
];
