import type { HighBrow } from "../types/HighBrow";
import type { UseZustandState } from "../types/UseZustandState";
import { useHighBrowStore } from "../ZustandStore";

export const useViewingMediaForDesignState = (): UseZustandState<
  HighBrow["viewingMediaForDesign"]
> => [
  useHighBrowStore((state) => state.viewingMediaForDesign),
  useHighBrowStore((state) => state.setViewingMediaForDesign),
];
