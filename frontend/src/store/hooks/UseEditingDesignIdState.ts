import type { HighBrow } from "../types/HighBrow";
import type { UseZustandState } from "../types/UseZustandState";
import { useHighBrowStore } from "../ZustandStore";

export const useEditingDesignIdState = (): UseZustandState<
  HighBrow["editingDesignId"]
> => [
  useHighBrowStore((state) => state.editingDesignId),
  useHighBrowStore((state) => state.setEditingDesignId),
];
