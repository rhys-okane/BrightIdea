import { usePlayingDesignState } from "@src/store/hooks/UsePlayingDesignState";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { useCallback } from "react";

export const useOnDesignPlay = () => {
  const [, setPlayingDesignId] = usePlayingDesignState();

  return useCallback(
    (design: PlayableDesign) => {
      setPlayingDesignId({
        id: design.id,
        isMine: design.isMine,
      });
    },
    [setPlayingDesignId]
  );
};
