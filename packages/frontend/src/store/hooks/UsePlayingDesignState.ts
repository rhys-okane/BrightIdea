import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const usePlayingDesignState = (): UseZustandState<HighBrow["playingDesign"]> => [
	useHighBrowStore(state => state.playingDesign),
	useHighBrowStore(state => state.setPlayingDesign),
];
