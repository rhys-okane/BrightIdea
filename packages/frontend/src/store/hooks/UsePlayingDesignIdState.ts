import type {HighBrow} from "../types/HighBrow";
import type {UseZustandState} from "../types/UseZustandState";
import {useHighBrowStore} from "../ZustandStore";

export const usePlayingDesignIdState = (): UseZustandState<HighBrow["playingDesignId"]> => [
  useHighBrowStore(state => state.playingDesignId),
  useHighBrowStore(state => state.setPlayingDesignId),
];