import type { HighBrow } from "../types/HighBrow";
import type { UseZustandState } from "../types/UseZustandState";
import { useHighBrowStore } from "../ZustandStore";

export const useUserState = (): UseZustandState<HighBrow["user"]> => [
  useHighBrowStore((state) => state.user),
  useHighBrowStore((state) => state.setUser),
];
