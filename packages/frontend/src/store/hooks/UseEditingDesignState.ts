import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const useEditingDesignState = (): UseZustandState<HighBrow["editingDesign"]> => [
	useHighBrowStore(state => state.editingDesign),
	useHighBrowStore(state => state.setEditingDesign),
];
