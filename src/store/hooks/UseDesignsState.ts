import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const useDesignsState = (): UseZustandState<HighBrow["designs"]> => [
  useHighBrowStore(state => state.designs),
  useHighBrowStore(state => state.setDesigns),
];
