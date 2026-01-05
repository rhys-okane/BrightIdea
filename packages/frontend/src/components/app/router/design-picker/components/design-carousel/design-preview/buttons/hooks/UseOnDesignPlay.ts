import { usePlayingDesignState } from "@src/store/hooks/UsePlayingDesignState";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { useCallback } from "react";

export const useOnDesignPlay = () => {
  const [, setPlayingDesign] = usePlayingDesignState();

  return useCallback(
    (design: PlayableDesign) => {
      setPlayingDesign(design);
    },
    [setPlayingDesign]
  );
};
